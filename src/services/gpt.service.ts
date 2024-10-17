import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { BufferMemory } from 'langchain/memory';
import { RedisChatMessageHistory } from '@langchain/community/stores/message/ioredis';
import { ChatOpenAI } from '@langchain/openai';
import { ConversationChain } from 'langchain/chains';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { ChatInputParams } from 'src/dto/chat_input_params.dto';
import { MessageService } from './message.service';
import metadata from '../config/metadata.json';

@Injectable()
export class GPTService {
  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => MessageService))
    private messageService: MessageService,
  ) {}
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
    // try keychat hello message
    try {
      const map = JSON.parse(input.content);
      if (map['c'] == 'signal' && map['type'] == 101) {
        this.logger.log('Hello message received');
        await this.messageService.sendMessageToClient(
          input.from,
          JSON.stringify(metadata),
        );
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {}

    this.logger.log(`Chat Input: ${JSON.stringify(input)}`);
    const selectedModel = this.getSelectedModelFromMetadata(input.priceModel);
    this.logger.log(`Selected Model: ${selectedModel.name} ,${input.content}`);

    if (selectedModel.price > 0) {
      if (input.payToken == null) {
        this.logger.log(
          `Payment Required: ${selectedModel.price} ${selectedModel.unit}`,
        );
        return;
      } else {
        // TODO excute payment logic
      }
      this.logger.log('paytoken: ' + input.payToken);
    }

    const model = new ChatOpenAI({
      model: selectedModel.name.toLocaleLowerCase(),
      temperature: 0.8,
      openAIApiKey: process.env.OPENAI_API_KEY,
      maxTokens: 4096,
    });
    const memory = this.getSession(selectedModel.name, input.from);
    const chain = new ConversationChain({ llm: model, memory });
    const { response } = await chain.invoke({ input: input.content });
    this.logger.log('AI Response:', response);
    this.messageService.sendMessageToClient(input.from, response);
    return response;
  }
  getSelectedModelFromMetadata(priceModel: string) {
    if (priceModel == null)
      return metadata.botPricePerMessageRequest.priceModels[0];
    for (const model of metadata.botPricePerMessageRequest.priceModels) {
      if (model.name.toLocaleLowerCase() === priceModel) {
        return model;
      }
    }
    return metadata.botPricePerMessageRequest.priceModels[0];
  }
}
