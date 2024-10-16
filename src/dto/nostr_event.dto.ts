export class NostrEventDto {
  id: string;
  from: string;
  to: string;
  content: string;
  createAt: number;
  sig: string;

  static parse(data: string): NostrEventDto {
    const jsonObj = JSON.parse(data);
    return new NostrEventDto().fromJSON(jsonObj);
  }
  fromJSON(jsonObj: any): NostrEventDto {
    this.id = jsonObj.id;
    this.from = jsonObj.from;
    this.to = jsonObj.to;
    this.content = jsonObj.content;
    this.createAt = jsonObj.createAt;
    this.sig = jsonObj.sig;
    return this;
  }
}
