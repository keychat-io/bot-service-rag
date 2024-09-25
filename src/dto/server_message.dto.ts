export enum ServerMessageType {
  Plain = 'Plain',
  SelectionRequest = 'SelectionRequest',
  SelectionAndConfirmPrice = 'SelectionAndConfirmPrice',
  OneTimePaymentRequest = 'OneTimePaymentRequest',
}

export class ServerMessageDto {
  type: ServerMessageType;
  id: string;
  description: string;
  data: string;
  list: [];
}
