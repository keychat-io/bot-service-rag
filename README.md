# Keychat Chat Bot Service

## Description

* Handle `/*` message. like: `/h` 
* Receive any text from client app, and send response
* Perform charging operations, receive ecash token

## Project setup
[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## DTO
Message from BotCenter

```json
{
  "id": "id1234",
  "from": "from1253",
  "to": "to123",
  "content": "content123",
  "decryptedDontent": "{\"type\":\"botText\",\"content\":\"Hi, I am keychat.\"}",
  "createAt": 1234567,
  "sig": "sig123"
}
```

### Message Struct 

Client
```
{
  type: MessageTypeEnum;
  message: string;
  id?: string;
  payToken?: string;
  priceModel?: string;
}
```

Server
```
{
  type: MessageTypeEnum;
  id: string;
  description: string;
  data: string;
  list: BotMessageData[];
}
```

BotMessageData
```
{
  name: string;  // price model id
  description: string;
  price: number;
  unit: string;
  mints: string[];
}
```

MessageTypeEnum 
```
{
  botText,
  botPricePerMessageRequest, 
  botOneTimePaymentRequest,  
}
```

### Client Commands
1. Client Message:
`{"type":"botText","message":"/h"}`

BotServer: send help message to user.
Server Response: `you can ask me any questions`

2. Client Message: `{"type":"botText","message":"/m"}`
BotServer: send all charge models to user. 

```
{
  "type": "botPricePerMessageRequest",
  "id": "SelectPriceModel",
  "message": "Please select a model to chat",
  "priceModels": [
    {
      "name": "gpt-3.5-turbo",
      "description": "",
      "price": 0,
      "unit": "sat",
      "mints": []
    },
    {
      "name": "gpt-4o-mini",
      "description": "",
      "price": 2,
      "unit": "sat",
      "mints": []
    }
  ]
}
```
If the user sets the charging configuration, a cashu Token will be attached to each message.

Example, If select `gpt-4o-mini` and  send `Who are your?` to bot.
Client's send message like this:

```json
{"type":"botText","message":"Who are your?","priceModel":"gpt-4o-mini","payToken":"cashuBo2Ftd2h0dHBzOi8vODMzMy5zcGFjZTozMzM4YXVjc2F0YXSBomFpSAB1nj-LBrNvYXCBo2FhAmFzeEBhODljMjk0ZTBjMDhkMzQ0YTljZmRhZDgzMzFmNDI5ZDRiZWE0ZDJkYjA0NzBiMjExZDM5MDY1MWRhZDAwOWZkYWNYIQKGsB8Zx6ABj3Z02asmKR9HFDySfVHgP_UDhnSPMvWquw"}
```

bot server will recive `payToken`, and make response to user.