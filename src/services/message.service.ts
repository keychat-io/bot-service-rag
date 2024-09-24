import { Inject, Injectable } from '@nestjs/common';
import { ClientMessageDto } from 'src/dto/client_message.dto';
import { NostrEventDto } from 'src/dto/nostr_event.dto';
import { CommandService } from './command.service';
import { GPTService } from './gpt.service';
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
      case 'Command':
        return this.commandService.proccessCommand(neo, ccd);
      case 'Plain':
        return this.gptService.chat({
          userId: neo.from,
          content: ccd.content,
          modelName: 'gpt-4o-mini',
        });
      case 'SelectionResponse':
        return this.proccessSelectionResponse(ccd);
      case 'PaymentResponse':
        return this.proccessPaymentResponse(ccd);
    }
  }

  proccessSelectionResponse(ccd: ClientMessageDto) {
    throw new Error('Method not implemented.');
  }
  proccessPaymentResponse(ccd: ClientMessageDto) {
    throw new Error('Method not implemented.');
  }

  helpCommand() {
    return 'Help command Response';
  }
}
