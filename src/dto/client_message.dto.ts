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
    this.type = jsonObj.type;
    this.message = jsonObj.message;
    this.payToken = jsonObj.payToken;
    this.priceModel = jsonObj.priceModel;
    return this;
  }
}
