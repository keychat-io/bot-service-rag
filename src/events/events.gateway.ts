import { Inject } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { MessageService } from 'src/services/message.service';
import { Server } from 'ws';

@WebSocketGateway(3001)
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  constructor(@Inject(MessageService) private commandService: MessageService) {}

  @SubscribeMessage('events')
  onEvent(client: any, data: any) {
    console.log('receive client:', data);

    return {
      event: 'events',
      data: this.commandService.helpCommand(),
    };
  }
}
