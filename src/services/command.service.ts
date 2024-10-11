import { Injectable, Logger } from '@nestjs/common';
import { ClientMessageDto } from 'src/dto/client_message.dto';
import { NostrEventDto } from 'src/dto/nostr_event.dto';
import { GPTService } from './gpt.service';
import botPricePerMessageRequest from '../config/botPricePerMessageRequest.json';

export enum BotSupportCommands {
  HELP = '/h',
  MODELS = '/m',
}

export function getBotSupportCommands(): Set<string> {
  return new Set(Object.values(BotSupportCommands));
}

@Injectable()
export class CommandService {
  private readonly logger = new Logger(CommandService.name);
  constructor(private gptService: GPTService) {}

  async proccessCommand(neo: NostrEventDto, cmd: ClientMessageDto) {
    this.logger.log(`cmd: ${cmd} received`);

    switch (cmd.message) {
      case BotSupportCommands.HELP:
        return 'Help command Response';
      case BotSupportCommands.MODELS:
        return botPricePerMessageRequest;
    }
  }
}
