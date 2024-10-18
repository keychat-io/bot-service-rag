import { MessageTypeEnum } from './message_type_enum';

export class ClientMessageDto {
  type: MessageTypeEnum;
  content: string;
  id?: string;
  payToken?: string;
  priceModel?: string;
  payTokenDecode?: any;

  static parse(data: string): ClientMessageDto {
    const jsonObj = JSON.parse(data);
    return new ClientMessageDto().fromJSON(jsonObj);
  }

  fromJSON(jsonObj: any): ClientMessageDto {
    this.id = jsonObj.id;
    this.type = MessageTypeEnum[jsonObj.type as keyof typeof MessageTypeEnum];
    if (this.type == null) throw new Error('NotClientMessageDtoError');
    if (jsonObj.message == null) throw new Error('NotClientMessageDtoError');
    this.content = jsonObj.message;
    this.payToken = jsonObj.payToken;
    this.priceModel = jsonObj.priceModel;
    this.payTokenDecode = jsonObj.payTokenDecode;
    return this;
  }
  toJson() {
    return JSON.stringify({
      id: this.id,
      type: MessageTypeEnum[this.type],
      message: this.content,
      payToken: this.payToken,
      priceModel: this.priceModel,
    });
  }
}
