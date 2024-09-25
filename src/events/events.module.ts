import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { MessageService } from 'src/services/message.service';
import { CommandService } from 'src/services/command.service';
import { GPTService } from 'src/services/gpt.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    EventsGateway,
    MessageService,
    CommandService,
    GPTService,
    ConfigService,
  ],
  exports: [EventsGateway],
})
export class EventsModule {}
