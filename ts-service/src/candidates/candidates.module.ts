import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidateDocument } from '../entities/candidate-document.entity';
import { CandidateSummary } from '../entities/candidate-summary.entity';
import { SampleCandidate } from '../entities/sample-candidate.entity';
import { CandidatesController } from './candidates.controller';
import { CandidatesService } from './candidates.service';
import { SummaryWorker } from './workers/summary.worker';
import { QueueService } from "../queue/queue.service";
import {
  SUMMARIZATION_PROVIDER,
} from '../llm/summarization-provider.interface';
import { FakeSummarizationProvider } from '../llm/fake-summarization.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CandidateDocument,
      CandidateSummary,
      SampleCandidate,
    ]),
  ],
  controllers: [CandidatesController],
  providers: [
    CandidatesService,
    SummaryWorker,
    QueueService,
    {
      provide: SUMMARIZATION_PROVIDER,
      useClass: FakeSummarizationProvider, 
    },
  ],
})
export class CandidatesModule {}