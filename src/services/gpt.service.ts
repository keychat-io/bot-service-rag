import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { BufferMemory } from 'langchain/memory';
import { RedisChatMessageHistory } from '@langchain/community/stores/message/ioredis';
import { ChatOpenAI } from '@langchain/openai';
import { ConversationChain } from 'langchain/chains';
import { ChatInputParams } from 'src/dto/chat_input_params.dto';
import { MessageService } from './message.service';
import metadata from '../config/metadata.json';
import { ClientMessageDto } from 'src/dto/client_message.dto';
import { RedisService } from './redis.service';

@Injectable()
export class GPTService {
  constructor(
    @Inject(forwardRef(() => MessageService))
    private messageService: MessageService,
    @Inject(RedisService) private redisService: RedisService,
  ) {}
  private readonly logger = new Logger(GPTService.name);

  getSession(modelName: string, userId: string): BufferMemory {
    return new BufferMemory({
      chatHistory: new RedisChatMessageHistory({
        sessionId: `${modelName}:${userId}`,
        sessionTTL: 300,
        client: this.redisService.getClient(),
      }),
    });
  }

  async proccessChat(input: ChatInputParams): Promise<string> {
    // try keychat hello message
    try {
      const map = JSON.parse(input.clientMessageDto.content);
      if (map['c'] == 'signal' && map['type'] == 101) {
        this.logger.log('Hello message received');
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {}

    this.logger.log(`Chat Input: ${JSON.stringify(input)}`);
    const selectedModel = this.getSelectedModelFromMetadata(
      input.to,
      input.clientMessageDto.priceModel,
    );

    this.logger.log(
      `Selected: ${selectedModel.name}, ${input.clientMessageDto.content}`,
    );

    // receive ecash payment
    try {
      await this.receiveEcash(selectedModel, input.clientMessageDto);
    } catch (error) {
      if (error.message == 'Payment_Required') {
        this.logger.log('Payment Required');
        return;
      }
      this.logger.log(`Payment Error: ${error.message}`, error.stack);
      await this.messageService.sendErrorMessageToClient(
        input.to,
        input.from,
        error.message,
      );
      return;
    }
    const model = new ChatOpenAI({
      model: selectedModel.name.toLowerCase(),
      temperature: 0.5,
      openAIApiKey: process.env.OPENAI_API_KEY,
      maxTokens: 4096,
    });
    const memory = this.getSession(selectedModel.name, input.from);
    const chain = new ConversationChain({ llm: model, memory });
    const { response, usage_metadata } = await chain.invoke({
      input: input.clientMessageDto.content,
    });
    this.logger.log('AI Response:', response);
    this.logger.log('AI usage_metadata:', usage_metadata);
    this.messageService.sendMessageToClient(input.to, input.from, response);
    return 'response';
  }
  async receiveEcash(
    selectedModel: {
      name: string;
      description: string;
      price: number;
      unit: string;
      mints: any[];
    },
    clientMessageDto: ClientMessageDto,
  ) {
    if (selectedModel.price == 0) return;
    if (clientMessageDto.payTokenDecode == null) {
      throw new Error('Payment_Required');
    } else {
      const map =
        typeof clientMessageDto.payTokenDecode === 'string'
          ? JSON.parse(clientMessageDto.payTokenDecode)
          : clientMessageDto.payTokenDecode;

      if (map['unit'] != 'sat') {
        throw new Error('Invalid payment unit, only support ecash sat');
      }
      if (map['amount'] < selectedModel.price) {
        throw new Error(
          `Insufficient Funds: ${map['amount']} < ${selectedModel.price}`,
        );
      }
      await this.messageService.receiveEcash(
        clientMessageDto.payToken,
        selectedModel.price,
      );
    }
  }
  getSelectedModelFromMetadata(bot: string, priceModel: string) {
    if (priceModel == null) {
      return metadata[bot].botPricePerMessageRequest.priceModels[0];
    }
    for (const model of metadata[bot].botPricePerMessageRequest.priceModels) {
      if (model.name.toLowerCase() === priceModel.toLowerCase()) {
        return model;
      }
    }
    return metadata[bot].botPricePerMessageRequest.priceModels[0];
  }
}
