import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ChatInputParams } from 'src/dto/chat_input_params.dto';
import { MessageService } from './message.service';
import metadata from '../config/metadata.json';
import { ClientMessageDto } from 'src/dto/client_message.dto';
import { RedisService } from './redis.service';
import axios from 'axios';

@Injectable()
export class GPTService {
  constructor(
    @Inject(forwardRef(() => MessageService))
    private messageService: MessageService,
    @Inject(RedisService) private redisService: RedisService,
  ) {}
  private readonly logger = new Logger(GPTService.name);

  async proccessChat(input: ChatInputParams): Promise<string> {
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
      this.logger.log(`Payment Error: ${error.message}`, error.stack);
      await this.messageService.sendErrorMessageToClient(
        input.to,
        input.from,
        error.message,
      );
      return;
    }
    this.logger.log(`Payment Success ${input.eventId}`);
    try {
      const { data, status } = await axios.post(
        process.env.RAG_SERVICE_URL,
        input,
      );
      this.logger.log('AI Response:', status, data);
      await this.messageService.sendMessageToClient(input.to, input.from, data);
    } catch (error) {
      console.error(error.response);
    }

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
    if (process.env.FREE === 'true') {
      this.logger.log('Free mode');
      return;
    }

    if (selectedModel.price == 0) return;
    if (clientMessageDto.payTokenDecode == null) {
      throw new Error('Please confirm the price plan');
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
