import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Inject } from '@nestjs/common';
import { Repository } from 'typeorm';

import { CandidateDocument } from '../../entities/candidate-document.entity';
import { CandidateSummary } from '../../entities/candidate-summary.entity';
import {
  SUMMARIZATION_PROVIDER,
  SummarizationProvider,
} from '../../llm/summarization-provider.interface';
import { QueueService } from '../../queue/queue.service';

@Injectable()
export class SummaryWorker {
  private readonly logger = new Logger(SummaryWorker.name);

  constructor(
    @InjectRepository(CandidateDocument)
    private readonly documentRepo: Repository<CandidateDocument>,

    @InjectRepository(CandidateSummary)
    private readonly summaryRepo: Repository<CandidateSummary>,

    private readonly queue: QueueService,

    @Inject(SUMMARIZATION_PROVIDER)
    private readonly summarizer: SummarizationProvider,
  ) {}

  async processJobs(): Promise<void> {
    const jobs = this.queue.getQueuedJobs();

    for (const job of jobs) {
      if (job.name !== 'generate-summary') {
        continue;
      }

      const payload = job.payload as {
        candidateId: string;
        summaryId: string;
      };
      this.logger.log(`Processing summary for candidate ${payload.candidateId}`);

      await this.processSummary(payload.candidateId, payload.summaryId);
      this.logger.log(
        `Summary ${payload.summaryId} generated successfully`
      );
      
    }
  }

  private async processSummary(
    candidateId: string,
    summaryId: string,
  ): Promise<void> {
    const summary = await this.summaryRepo.findOne({
      where: { id: summaryId },
    });

    if (!summary) {
      return;
    }

    try {
      const documents = await this.documentRepo.find({
        where: { candidateId },
      });

      const rawTexts = documents.map((d) => d.rawText);

      const result = await this.summarizer.generateCandidateSummary({
        candidateId,
        documents: rawTexts,
      });

      summary.status = 'completed';
      summary.score = result.score;
      summary.strengths = result.strengths;
      summary.concerns = result.concerns;
      summary.summary = result.summary;
      summary.recommendedDecision = result.recommendedDecision;
      summary.provider = 'fake';
      summary.promptVersion = 'v1';

      await this.summaryRepo.save(summary);
    } catch (error) {
      summary.status = 'failed';
      summary.errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      await this.summaryRepo.save(summary);

      this.logger.error('Summary generation failed', error);
    }
  }
}