import { randomUUID } from 'crypto';

import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuthUser } from '../auth/auth.types';
import { CandidateDocument } from '../entities/candidate-document.entity';
import { CandidateSummary } from '../entities/candidate-summary.entity';
import { SampleCandidate } from '../entities/sample-candidate.entity';
import { QueueService } from '../queue/queue.service';
import { OcrService } from "./ocr.service"
import {  DocumentDTO } from './dto/upload-document.dto';
import { SummaryWorker } from './workers/summary.worker'

import * as fs from "fs";
import * as path from "path"

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

    private readonly worker: SummaryWorker,

    private readonly ocrService: OcrService
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
    rawText?: string,
    file?: Express.Multer.File
  ) {
    await this.ensureCandidate(user, candidateId);

    const data = {rawText, file};
    const validatedData = plainToInstance(DocumentDTO, data)
    const errors = await validate(validatedData);
    if (errors.length > 0) {
      throw new Error('Invalid document input');
    }
    
    let fileKey;
    let fileText;

    if(validatedData.file) {
        fileKey = await this.saveFile(validatedData.file)
        fileText = await this.ocrService.extractText(validatedData.file)
    }
    

    const doc = this.documentRepo.create({
      id: randomUUID(),
      candidateId,
      documentType: file?.mimetype ?? "PLAIN_TEXT",
      fileName: file?.originalname,
      storageKey: fileKey,
      rawText: file ? fileText : validatedData.rawText,
    });

    return this.documentRepo.save(doc);
  }

  async saveFile(file: Express.Multer.File) {
    const uploadPath = path.join(__dirname, '..', 'candidate-uploads', file.originalname)
    fs.writeFileSync(uploadPath, file.buffer)
    return file.originalname
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