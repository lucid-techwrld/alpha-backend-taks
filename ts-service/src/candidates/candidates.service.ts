import { randomUUID } from 'crypto';

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuthUser } from '../auth/auth.types';
import { CandidateDocument } from '../entities/candidate-document.entity';
import { CandidateSummary } from '../entities/candidate-summary.entity';
import { SampleCandidate } from '../entities/sample-candidate.entity';
import { QueueService } from '../queue/queue.service';
import { UploadCandidateDocumentDto } from './dto/upload-document.dto';
import { SummaryWorker } from './workers/summary.worker'

@Injectable()
export class CandidatesService {
  constructor(
    @InjectRepository(CandidateDocument)
    private readonly documentRepo: Repository<CandidateDocument>,

    @InjectRepository(CandidateSummary)
    private readonly summaryRepo: Repository<CandidateSummary>,

    @InjectRepository(SampleCandidate)
    private readonly candidateRepo: Repository<SampleCandidate>,

    private readonly queue: QueueService,

    private readonly worker: SummaryWorker
  ) {}

  async ensureCandidate(user: AuthUser, candidateId: string) {
    const candidate = await this.candidateRepo.findOne({
      where: { id: candidateId, workspaceId: user.workspaceId },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    return candidate;
  }

  async uploadDocument(
    user: AuthUser,
    candidateId: string,
    dto: UploadCandidateDocumentDto,
  ) {
    await this.ensureCandidate(user, candidateId);

    const doc = this.documentRepo.create({
      id: randomUUID(),
      candidateId,
      documentType: dto.documentType,
      fileName: dto.fileName,
      storageKey: `local/${randomUUID()}`,
      rawText: dto.rawText,
    });

    return this.documentRepo.save(doc);
  }

  async requestSummary(user: AuthUser, candidateId: string) {
    await this.ensureCandidate(user, candidateId);

    const summary = await this.summaryRepo.save({
      id: randomUUID(),
      candidateId,
      status: 'pending',
    });

    this.queue.enqueue('generate-summary', {
        candidateId,
        summaryId: summary.id,
      });
      
      await this.worker.processJobs();

    return { status: 'queued', summaryId: summary.id };
  }

  async listSummaries(user: AuthUser, candidateId: string) {
    await this.ensureCandidate(user, candidateId);

    return this.summaryRepo.find({
      where: { candidateId },
      order: { createdAt: 'DESC' },
    });
  }

  async getSummary(user: AuthUser, candidateId: string, summaryId: string) {
    await this.ensureCandidate(user, candidateId);

    const summary = await this.summaryRepo.findOne({
      where: { id: summaryId, candidateId },
    });

    if (!summary) {
      throw new NotFoundException('Summary not found');
    }

    return summary;
  }
}