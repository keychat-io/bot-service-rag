import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessageService } from './services/message.service';
import { CommandService } from './services/command.service';
import { GPTService } from './services/gpt.service';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { QueueService } from './services/queue.service';

@Module({
  imports: [
    // EventsModule,
    ConfigModule.forRoot({ ignoreEnvFile: true, load: [configuration] }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    MessageService,
    QueueService,
    CommandService,
    GPTService,
  ],
})
export class AppModule {}
