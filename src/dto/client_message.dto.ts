export enum ClientMessageType {
  Plain = 'Plain',
  Command = 'Command',
  SelectionResponse = 'SelectionResponse',
  PaymentResponse = 'PaymentResponse',
}

export class ClientMessageDto {
  type: ClientMessageType;
  content: string;
  payMode?: string;
  payToken?: string;

  static parse(data: string): ClientMessageDto {
    const jsonObj = JSON.parse(data);
    return new ClientMessageDto().fromJSON(jsonObj);
  }
  fromJSON(jsonObj: any): ClientMessageDto {
    this.type = jsonObj.type;
    this.content = jsonObj.content;
    this.payMode = jsonObj.payMode;
    this.payToken = jsonObj.payToken;
    return this;
  }
}
