import { Injectable, Logger } from '@nestjs/common';
import { ClientMessageDto } from 'src/dto/client_message.dto';
import { NostrEventDto } from 'src/dto/nostr_event.dto';

@Injectable()
export class CommandService {
  private readonly logger = new Logger(CommandService.name);

  proccessCommand(neo: NostrEventDto, cmd: ClientMessageDto) {
    this.logger.log(`cmd: ${cmd} received`);

    switch (cmd.content) {
      case '/h':
        return this.helpCommand();
      case '/new':
        return 'New command Response';
    }
  }

  helpCommand() {
    return 'Help command Response';
  }
}
