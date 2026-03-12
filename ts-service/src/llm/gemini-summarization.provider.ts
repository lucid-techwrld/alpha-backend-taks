import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  SummarizationProvider,
  CandidateSummaryInput,
  CandidateSummaryOutput,
} from './summarization-provider.interface';

import {SummarySchema} from './summary-schema'

@Injectable()
export class GeminiSummarizationProvider implements SummarizationProvider {
  private client: GoogleGenerativeAI;

  constructor() {
    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }

  async generateCandidateSummary(
    input: CandidateSummaryInput,
  ): Promise<CandidateSummaryOutput> {
    const model = this.client.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });

    const combinedText = input.documents.join('\n\n');

    const prompt = `
        You are an AI recruiter assistant.

        Analyze the candidate documents.

        Return STRICT JSON only.

        Schema:

        {
        "score": number between 0 and 100,
        "strengths": string[],
        "concerns": string[],
        "summary": string,
        "recommendedDecision": "advance" | "hold" | "reject"
        }

        Rules:
        - No explanations
        - No markdown
        - No extra text
        - JSON only

        Documents:
        ${combinedText}
        `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();


    let parsed;

    try {
        parsed = JSON.parse(text);
    } catch {
        throw new Error('Invalid JSON returned from Gemini');
    }

    const validatedResponse = SummarySchema.parse(parsed) //For a better safe response

    return validatedResponse
  }
}