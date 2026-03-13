import { IsNotEmpty, IsString, IsOptional, ValidateIf } from 'class-validator';

export class UploadCandidateDocumentDto {
  @IsString()
  @IsNotEmpty()
  documentType!: string;

  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsString()
  @IsNotEmpty()
  rawText!: string;
}

export class DocumentDTO {
  @IsString()
  @IsOptional()
  rawText?: string;

  @ValidateIf(o => !o.text)
  @IsNotEmpty()
  file?: Express.Multer.File
}