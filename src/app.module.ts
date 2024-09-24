import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { MessageService } from './services/message.service';
import { CommandService } from './services/command.service';
import { GPTService } from './services/gpt.service';

@Module({
  imports: [EventsModule],
  controllers: [AppController],
  providers: [AppService, MessageService, CommandService, GPTService],
})
export class AppModule {}
