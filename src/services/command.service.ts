import { Injectable, Logger } from '@nestjs/common';
import { ClientMessageDto } from 'src/dto/client_message.dto';
import { NostrEventDto } from 'src/dto/nostr_event.dto';
import { GPTService } from './gpt.service';

@Injectable()
export class CommandService {
  private readonly logger = new Logger(CommandService.name);
  constructor(private gptService: GPTService) {}

  async proccessCommand(neo: NostrEventDto, cmd: ClientMessageDto) {
    this.logger.log(`cmd: ${cmd} received`);

    switch (cmd.content) {
      case '/h':
        return this.helpCommand();
      case '/new':
        await this.gptService.clearSession(neo.from);
        return 'Success';
      case '/models':
        return await this.gptService.getModels();
    }
  }

  helpCommand() {
    return 'Help command Response';
  }
}
