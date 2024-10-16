import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientMessageDto } from 'src/dto/client_message.dto';
import { NostrEventDto } from 'src/dto/nostr_event.dto';
import { CommandService, getBotSupportCommands } from './command.service';
import { GPTService } from './gpt.service';
import { MessageTypeEnum } from 'src/dto/message_type_enum';
import { QueueService } from './queue.service';
import { ChatInputParams } from 'src/dto/chat_input_params.dto';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(GPTService.name);

  constructor(
    @Inject(QueueService) private queueService: QueueService,
    @Inject(CommandService) private commandService: CommandService,
    @Inject(GPTService) private gptService: GPTService,
  ) {}

  // proccessMessage(command: string) {
  //   console.log(`Command: ${command} received`);
  //   const neo = NostrEventDto.parse(command);

  proccessMessage(neo: NostrEventDto) {
    const ccd = ClientMessageDto.parse(neo.decryptedDontent);
    this.logger.log(`ClientCommandDto: ${JSON.stringify(ccd)}`);
    switch (ccd.type) {
      case MessageTypeEnum.botText:
        return this.proccessText(neo, ccd);
      case MessageTypeEnum.botOneTimePaymentRequest:
        return this.proccessOnetimePaymentResponse(ccd);
      default:
        this.logger.error(`Unknown message type: ${ccd.type}`);
        return this.proccessText(neo, ccd);
    }
  }

  proccessText(neo: NostrEventDto, ccd: ClientMessageDto) {
    if (
      ccd.message.startsWith('/') &&
      getBotSupportCommands().has(ccd.message)
    ) {
      return this.commandService.proccessCommand(neo, ccd);
    }
    // start chat job
    this.queueService.addJob({
      eventId: neo.id,
      from: neo.from,
      to: neo.to,
      content: ccd.message,
      priceModel: ccd.priceModel,
      payToken: ccd.payToken,
    } as ChatInputParams);
    return { code: 200 };
  }

  proccessOnetimePaymentResponse(ccd: ClientMessageDto) {
    console.log(ccd.payToken);
    throw new Error('Method not implemented.');
  }

  helpCommand() {
    return 'After choosing the paid model, you can ask me any questions';
  }
}
