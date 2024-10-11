import { MessageTypeEnum } from './message_type_enum';

export class ClientMessageDto {
  type: MessageTypeEnum;
  message: string;
  id?: string;
  payToken?: string;
  priceModel?: string;

  static parse(data: string): ClientMessageDto {
    const jsonObj = JSON.parse(data);
    return new ClientMessageDto().fromJSON(jsonObj);
  }

  fromJSON(jsonObj: any): ClientMessageDto {
    this.id = jsonObj.id;
    this.type = MessageTypeEnum[jsonObj.type as keyof typeof MessageTypeEnum];
    if (this.type == null) throw Error('type field is required');
    if (jsonObj.message == null) throw Error('message filed is required');
    this.message = jsonObj.message;
    this.payToken = jsonObj.payToken;
    this.priceModel = jsonObj.priceModel;
    return this;
  }
}
