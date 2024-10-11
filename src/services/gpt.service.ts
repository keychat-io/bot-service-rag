import { Injectable, Logger } from '@nestjs/common';
import { BufferMemory } from 'langchain/memory';
import { RedisChatMessageHistory } from '@langchain/community/stores/message/ioredis';
import { ChatOpenAI } from '@langchain/openai';
import { ConversationChain } from 'langchain/chains';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

export enum OpenAIModels {
  GPT_3_5_TURBO = 'gpt-3.5-turbo',
  GPT_4O = 'gpt-4o',
  GPT_4O_MINI = 'gpt-4o-mini',
  GPT_4_TURBO = 'gpt-4-turbo',
}

@Injectable()
export class GPTService {
  constructor(private configService: ConfigService) {}
  private readonly logger = new Logger(GPTService.name);
  redisClient: Redis;

  async onModuleInit(): Promise<void> {
    this.redisClient = new Redis(this.configService.get<string>('redis'));
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

  async getSelectedModel(from: string) {
    const key = `gptModel:${from}`;
    const res = await this.redisClient.get(key);
    return res || 'gpt-4o-mini';
  }

  async setSelectedModel(from: string, model: string) {
    if (!Object.values(OpenAIModels).includes(model as OpenAIModels)) {
      this.logger.debug('Invalid Model Selected');
      model = 'gpt-4o-mini';
    }
    const key = `gptModel:${from}`;
    await this.redisClient.set(key, model);
  }

  async clearSession(from: string) {
    const model = await this.getSelectedModel(from);
    const memory = this.getSession(model, from);
    memory.clear();
    return 'Success';
  }

  async chat(input: {
    userId: string;
    content: string;
    priceModel: string;
  }): Promise<string> {
    const modelName = getModelEnumByName(input.priceModel);
    this.logger.log(`Selected Model: ${modelName}`);
    const model = new ChatOpenAI({
      model: modelName,
      temperature: 0.8,
      openAIApiKey: process.env.OPENAI_API_KEY,
      configuration: {
        baseURL: 'https://api.aihubmix.com/v1',
      },
    });
    const memory = this.getSession(modelName, input.userId);
    const chain = new ConversationChain({ llm: model, memory });
    const { response } = await chain.invoke({ input: input.content });
    this.logger.log(`AI Response: ${response}`);
    return response;
  }
}
function getModelEnumByName(priceModel: string): string {
  switch (priceModel) {
    case 'gpt-3.5-turbo':
      return OpenAIModels.GPT_3_5_TURBO;
    case 'gpt-4o-mini':
      return OpenAIModels.GPT_4O_MINI;
    case 'gpt-4-turbo':
      return OpenAIModels.GPT_4_TURBO;
    default:
      return OpenAIModels.GPT_4O;
  }
}
