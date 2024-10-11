import { MessageTypeEnum } from './message_type_enum';

class BotMessageData {
  name: string;
  description: string;
  price: number;
  unit: string;
  mints: string[];
}
export class ServerMessageDto {
  type: MessageTypeEnum;
  id: string;
  description: string;
  data: string;
  list: BotMessageData[];
}
