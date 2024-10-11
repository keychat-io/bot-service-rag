import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientMessageDto } from 'src/dto/client_message.dto';
import { NostrEventDto } from 'src/dto/nostr_event.dto';
import { CommandService, getBotSupportCommands } from './command.service';
import { GPTService } from './gpt.service';
import { MessageTypeEnum } from 'src/dto/message_type_enum';
// import { Cat } from './interfaces/cat.interface';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(GPTService.name);

  constructor(
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
    return this.gptService.chat({
      userId: neo.from,
      content: ccd.message,
      priceModel: ccd.priceModel,
      payToken: ccd.payToken,
    });
  }

  // async proccessSelectionResponse(from: string, ccd: ClientMessageDto) {
  //   switch (ccd.id) {
  //     case 'SelectModel':
  //       await this.gptService.setSelectedModel(from, ccd.message);
  //       return 'Success';
  //   }
  // }
  proccessOnetimePaymentResponse(ccd: ClientMessageDto) {
    console.log(ccd.payToken);
    throw new Error('Method not implemented.');
  }

  helpCommand() {
    return 'After choosing the paid model, you can ask me any questions';
  }
}
