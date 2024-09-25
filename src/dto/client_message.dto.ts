export enum ClientMessageType {
  Plain = 'Plain',
  Command = 'Command',
  SelectionResponse = 'SelectionResponse',
  PaymentResponse = 'OneTimePaymentResponse',
}

export class ClientMessageDto {
  type: ClientMessageType;
  content: string;
  id?: string;
  payToken?: string;

  static parse(data: string): ClientMessageDto {
    const jsonObj = JSON.parse(data);
    return new ClientMessageDto().fromJSON(jsonObj);
  }

  fromJSON(jsonObj: any): ClientMessageDto {
    this.id = jsonObj.id;
    this.type = jsonObj.type;
    this.content = jsonObj.content;
    this.payToken = jsonObj.payToken;
    return this;
  }
}
