import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
  
  import { CurrentUser } from '../auth/auth-user.decorator';
  import { AuthUser } from '../auth/auth.types';
  import { FakeAuthGuard } from '../auth/fake-auth.guard';
  import { CandidatesService } from './candidates.service';


  
  @Controller('candidates')
  @UseGuards(FakeAuthGuard)
  export class CandidatesController {
    constructor(private readonly service: CandidatesService) {}
  
    @Post(':candidateId/documents')
    @UseInterceptors(FileInterceptor("file"))
    uploadDocument(
      @CurrentUser() user: AuthUser,
      @Param('candidateId') candidateId: string,
      @UploadedFile() file?: Express.Multer.File,
      @Body('rawText') rawText?: string,
    ) {
      return this.service.uploadDocument(user, candidateId, rawText, file);
    }
  
    @Post(':candidateId/summaries/generate')
    generateSummary(
      @CurrentUser() user: AuthUser,
      @Param('candidateId') candidateId: string,
    ) {
      return this.service.requestSummary(user, candidateId);
    }
  
    @Get(':candidateId/summaries')
    listSummaries(
      @CurrentUser() user: AuthUser,
      @Param('candidateId') candidateId: string,
    ) {
      return this.service.listSummaries(user, candidateId);
    }
  
    @Get(':candidateId/summaries/:summaryId')
    getSummary(
      @CurrentUser() user: AuthUser,
      @Param('candidateId') candidateId: string,
      @Param('summaryId') summaryId: string,
    ) {
      return this.service.getSummary(user, candidateId, summaryId);
    }
  }