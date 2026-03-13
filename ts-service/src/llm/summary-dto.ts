import {
  IsNumber,
  Min,
  Max,
  IsArray,
  IsString,
  IsEnum,
} from 'class-validator';

export enum RecommendedDecision {
  ADVANCE = 'advance',
  HOLD = 'hold',
  REJECT = 'reject',
}

export class SummaryDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  score!: number;

  @IsArray()
  @IsString({ each: true })
  strengths!: string[];

  @IsArray()
  @IsString({ each: true })
  concerns!: string[];

  @IsString()
  summary!: string;

  @IsEnum(RecommendedDecision)
  recommendedDecision!: RecommendedDecision;
}