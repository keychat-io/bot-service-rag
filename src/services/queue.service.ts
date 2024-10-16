import { forwardRef, Inject, Injectable } from '@nestjs/common';
import BeeQueue from 'bee-queue';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { GPTService } from './gpt.service';
import { ChatInputParams } from 'src/dto/chat_input_params.dto';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);
  private queue: BeeQueue;

  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => GPTService)) private gptService: GPTService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.queue = new BeeQueue('chatgptQueue', {
      redis: {
        host: this.configService.get<string>('redis.host'),
        port: this.configService.get<number>('redis.port'),
      },
      isWorker: true,
    });
    this.queue.process(async (job, done) => {
      this.logger.log(`Processing job: ${job.id} ${JSON.stringify(job.data)}`);
      await this.gptService.proccessChat(job.data as ChatInputParams);
      done(null, job.data);
    });
  }

  async addJob(job: ChatInputParams) {
    this.logger.log(`Adding job: ${job}`);
    await this.queue.createJob(job).save();
  }
}
