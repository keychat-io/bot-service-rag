import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientMessageDto } from 'src/dto/client_message.dto';
import { NostrEventDto } from 'src/dto/nostr_event.dto';
import { GPTService } from './gpt.service';
import { MessageTypeEnum } from 'src/dto/message_type_enum';
import { QueueService } from './queue.service';
import { ChatInputParams } from 'src/dto/chat_input_params.dto';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { delay } from 'rxjs';
import WS from 'ws';
import axios from 'axios';
import { botPricePerMessageRequest } from '../config/metadata.json';

enum BotSupportCommands {
  HELP = '/h',
  MODELS = '/m',
}

function getBotSupportCommands(): Set<string> {
  return new Set(Object.values(BotSupportCommands));
}

@Injectable()
export class MessageService {
  private readonly logger = new Logger(GPTService.name);

  private websocket: ReconnectingWebSocket;

  constructor(@Inject(QueueService) private queueService: QueueService) {
    if (process.env.BOT_CENTER_SUBSCRIBE == null) {
      throw new Error('process.env.BOT_CENTER_SUBSCRIBE is null');
    }
    this.websocket = new ReconnectingWebSocket(
      process.env.BOT_CENTER_SUBSCRIBE,
      [],
      { WebSocket: WS },
    );
    this.websocket.addEventListener('open', () => {
      this.logger.log(`${process.env.BOT_CENTER_SUBSCRIBE} connected`);
      this.sendHelloMessage();
    });

    this.websocket.addEventListener('message', (data) => {
      this.logger.log(`message: ${data.data}`);
      let ned: NostrEventDto;
      try {
        ned = NostrEventDto.parse(data.data);
        this.proccessMessage(ned);
      } catch (error) {
        this.logger.error(error.message, error.stack);
      } finally {
        if (ned != null && ned.id != null) {
          this.websocket.send(ned.id);
        }
      }
    });
  }
  async sendMessageToClient(to: string, message: string) {
    try {
      const url = `${process.env.BOT_CENTER_SEND_MESSAGE}/from/${process.env.GPT_BOT_PUBKEY}/to/${to}`;

      const response = await axios.post(url, message);
      this.logger.log(`Message response: ${JSON.stringify(response.data)}`);
    } catch (error) {
      this.logger.error(
        `Failed to send message: ${error.message}`,
        error.stack,
      );
    }
  }
  async sendHelloMessage() {
    if (process.env.GPT_BOT_PUBKEY.length === 0) {
      this.logger.error('process.env.GPT_BOT_PUBKEY is empty');
      return;
    }
    await delay(500);
    this.websocket.send(process.env.GPT_BOT_PUBKEY);
  }

  proccessMessage(neo: NostrEventDto) {
    let ccd: ClientMessageDto;
    try {
      ccd = ClientMessageDto.parse(neo.content);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      ccd = new ClientMessageDto().fromJSON({
        type: MessageTypeEnum.botText,
        message: neo.content,
      });
    }
    this.logger.log(`ClientCommandDto: ${JSON.stringify(ccd)}`);
    switch (ccd.type) {
      case MessageTypeEnum.botText:
        return this.proccessText(neo, ccd);
      case MessageTypeEnum.botOneTimePaymentRequest:
        return this.proccessOnetimePaymentResponse(ccd);
      default:
        this.logger.error(`Unknown message type: ${ccd.type}`);
        return this.sendMessageToClient(neo.from, 'Unknown message type');
    }
  }

  proccessText(neo: NostrEventDto, ccd: ClientMessageDto) {
    if (
      ccd.message.startsWith('/') &&
      getBotSupportCommands().has(ccd.message)
    ) {
      return this.proccessCommand(neo, ccd);
    }
    // start chat job
    this.queueService.addJob({
      eventId: neo.id,
      from: neo.from,
      to: neo.to,
      content: ccd.message,
      priceModel: ccd.priceModel,
      payToken: ccd.payToken,
    } as ChatInputParams);
    return { code: 200 };
  }

  proccessOnetimePaymentResponse(ccd: ClientMessageDto) {
    console.log(ccd.payToken);
    throw new Error('Method not implemented.');
  }

  async proccessCommand(neo: NostrEventDto, cmd: ClientMessageDto) {
    this.logger.log(`cmd: ${cmd.toJson()} received`);

    switch (cmd.message) {
      case BotSupportCommands.HELP:
        const helpMessage = `I am a chatbot that can help you with your queries. Pay ecash for each message you send.`;
        return this.sendMessageToClient(neo.from, helpMessage);
      case BotSupportCommands.MODELS:
        return this.sendMessageToClient(
          neo.from,
          JSON.stringify(botPricePerMessageRequest),
        );
    }
  }
}
