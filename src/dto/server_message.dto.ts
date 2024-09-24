export enum ServerMessageType {
  Plain = 'Plain',
  SelectionRequest = 'SelectionRequest',
  PaymentRequest = 'PaymentRequest',
}

export class ServerMessageDto {
  type: ServerMessageType;
  id: string;
  description: string;
  data: string;
  list: [];
}
