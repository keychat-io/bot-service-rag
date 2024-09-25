import { Body, Controller, Get, Inject, Logger, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { MessageService } from './services/message.service';
import { NostrEventDto } from './dto/nostr_event.dto';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(
    private readonly appService: AppService,
    @Inject(MessageService) private readonly messageService: MessageService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/chat')
  async chat(@Body() body: NostrEventDto) {
    this.logger.log(body);
    const res = await this.messageService.proccessMessage(body);
    return { message: res };
  }
}
