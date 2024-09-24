import { Injectable, Logger } from '@nestjs/common';
import { BufferMemory } from 'langchain/memory';
import { RedisChatMessageHistory } from '@langchain/community/stores/message/ioredis';
import { ChatOpenAI } from '@langchain/openai';
import { ConversationChain } from 'langchain/chains';
import Redis from 'ioredis';
import { ChainValues } from '@langchain/core/utils/types';

@Injectable()
export class GPTService {
  private readonly logger = new Logger(GPTService.name);
  redisClient: any;

  async onModuleInit(): Promise<void> {
    this.redisClient = new Redis('redis://localhost:6379');
    this.logger.log('Redis Client Connected');
  }

  beforeApplicationShutdown(): void {
    this.redisClient.quit();
  }

  getSession(modelName: string, userId: string): BufferMemory {
    return new BufferMemory({
      chatHistory: new RedisChatMessageHistory({
        sessionId: `${modelName}:${userId}`,
        sessionTTL: 300,
        client: this.redisClient,
      }),
    });
  }

  async chat(input: {
    userId: string;
    content: string;
    modelName: string;
  }): Promise<string> {
    const model = new ChatOpenAI({
      model: input.modelName,
      temperature: 0.8,
      openAIApiKey: process.env.OPENAI_API_KEY,
      configuration: {
        baseURL: 'https://api.aihubmix.com/v1',
      },
    });
    const memory = this.getSession(input.modelName, input.userId);
    const chain = new ConversationChain({ llm: model, memory });
    this.logger.log(`User Input: ${input.content}`);
    const { response } = await chain.invoke({ input: input.content });
    this.logger.log(`AI Response: ${response}`);
    return response;
  }
}
