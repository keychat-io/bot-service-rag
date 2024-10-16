import { Injectable, Logger } from '@nestjs/common';
import { BufferMemory } from 'langchain/memory';
import { RedisChatMessageHistory } from '@langchain/community/stores/message/ioredis';
import { ChatOpenAI } from '@langchain/openai';
import { ConversationChain } from 'langchain/chains';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import * as aiModels from '../config/aiModels.json';
import { ChatInputParams } from 'src/dto/chat_input_params.dto';
@Injectable()
export class GPTService {
  constructor(private configService: ConfigService) {}
  private readonly logger = new Logger(GPTService.name);
  redisClient: Redis;

  async onModuleInit(): Promise<void> {
    this.redisClient = new Redis(this.configService.get<string>('redisUrl'));
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
    // if (!Object.values(OpenAIModels).includes(model as OpenAIModels)) {
    //   this.logger.debug('Invalid Model Selected');
    //   model = 'gpt-4o-mini';
    // }
    const key = `gptModel:${from}`;
    await this.redisClient.set(key, model);
  }

  async clearSession(from: string) {
    const model = await this.getSelectedModel(from);
    const memory = this.getSession(model, from);
    memory.clear();
    return 'Success';
  }

  async proccessChat(input: ChatInputParams): Promise<string> {
    this.logger.log(`Chat Input: ${JSON.stringify(input)}`);
    let selectedModel: { name: string; price: number; unit: string } =
      aiModels.find((model) => model.name === input.priceModel);
    this.logger.log(`Chat Input2:`);

    if (selectedModel == null) {
      selectedModel = aiModels[0];
    }
    if (selectedModel.price > 0) {
      if (input.payToken == null) {
        this.logger.log(
          `Payment Required: ${selectedModel.price} ${selectedModel.unit}`,
        );
        return;
      }
      // TODO excute payment logic
      this.logger.log('paytoken: ' + input.payToken);
    }
    this.logger.log(`Chat Input3:`);

    this.logger.log(`Selected Model: ${selectedModel.name} ${input.content}`);
    const model = new ChatOpenAI({
      model: selectedModel.name,
      temperature: 1,
      openAIApiKey: process.env.OPENAI_API_KEY,
      maxTokens: 2048,
      // configuration: {
      // organization: process.env.OPENAI_ORG_ID,
      // baseURL: 'https://api.aihubmix.com/v1',
      // },
    });
    const memory = this.getSession(selectedModel.name, input.from);
    const chain = new ConversationChain({ llm: model, memory });
    const { response } = await chain.invoke({ input: input.content });
    this.logger.log(`AI Response: ${response}`);
    return response;
  }
}
