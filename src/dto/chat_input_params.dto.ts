import { ClientMessageDto } from './client_message.dto';

export class ChatInputParams {
  eventId: string;
  from: string;
  to: string;
  clientMessageDto: ClientMessageDto;
}
