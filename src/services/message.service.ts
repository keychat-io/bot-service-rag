import { Inject, Injectable } from '@nestjs/common';
import { ClientMessageDto } from 'src/dto/client_message.dto';
import { NostrEventDto } from 'src/dto/nostr_event.dto';
import { CommandService, getBotSupportCommands } from './command.service';
import { GPTService } from './gpt.service';
import { MessageTypeEnum } from 'src/dto/message_type_enum';
// import { Cat } from './interfaces/cat.interface';

@Injectable()
export class MessageService {
  constructor(
    @Inject(CommandService) private commandService: CommandService,
    @Inject(GPTService) private gptService: GPTService,
  ) {}

  // proccessMessage(command: string) {
  //   console.log(`Command: ${command} received`);
  //   const neo = NostrEventDto.parse(command);

  proccessMessage(neo: NostrEventDto) {
    const ccd = ClientMessageDto.parse(neo.decryptedDontent);
    console.log(`ClientCommandDto: ${ccd}`);
    switch (ccd.type) {
      case MessageTypeEnum.botText:
        if (getBotSupportCommands().has(ccd.message)) {
          return this.commandService.proccessCommand(neo, ccd);
        }
        return this.gptService.chat({
          userId: neo.from,
          content: ccd.message,
          priceModel: ccd.priceModel,
        });
      case MessageTypeEnum.botOneTimePaymentRequest:
        return this.proccessOnetimePaymentResponse(ccd);
    }
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
