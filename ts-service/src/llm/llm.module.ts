import { Module } from '@nestjs/common';
import { GeminiSummarizationProvider } from './gemini-summarization.provider';
import { FakeSummarizationProvider } from './fake-summarization.provider';
import { SUMMARIZATION_PROVIDER } from './summarization-provider.interface';

@Module({
  providers: [
    {
      provide: SUMMARIZATION_PROVIDER,
      useClass:
        process.env.NODE_ENV === 'development'
          ? FakeSummarizationProvider
          : GeminiSummarizationProvider,
    },
  ],
  exports: [SUMMARIZATION_PROVIDER],
})
export class LlmModule {}