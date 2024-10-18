import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessageService } from './services/message.service';
import { GPTService } from './services/gpt.service';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { QueueService } from './services/queue.service';
import { RedisService } from './services/redis.service';

@Module({
  imports: [
    ConfigModule.forRoot({ ignoreEnvFile: true, load: [configuration] }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RedisService,
    GPTService,
    QueueService,
    MessageService,
  ],
})
export class AppModule {}
