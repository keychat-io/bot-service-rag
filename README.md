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

## Set Bot Metadata
Once set, the app will recognize this account as a bot.

```
curl POST -H 'Content-type: application/json' --data '{"name":"ChatGPT","type":"ChatBot","description":"I am a chatbot that can help you with your queries. Pay ecash for each message you send.","pubkey":"0d61dcd0bbccdfe6b222f87c7d724da3050569ef8dc6f26ef7d74d24eafd97cb","commands":[{"name":"/h","description":"Show help message"},{"name":"/m","description":"Pay per message plan"}],"botPricePerMessageRequest":{"type":"botPricePerMessageRequest","message":"Please select a model to chat","priceModels":[{"name":"GPT-4o","description":"","price":0,"unit":"sat","mints":[]},{"name":"GPT-4o-mini","description":"","price":2,"unit":"sat","mints":[]},{"name":"GPT-4-Turbo","description":"","price":3,"unit":"sat","mints":[]}]}}' http://0.0.0.0:5001/metadata/2714ef65b4f14c5c74b1d817eefcc1a994835de3034bfd2d5e2d3e8abbbadf32
```
Success
```json
{"code":200,"error":null,"data":"4433dec54c89fcc97d28049ffdc1b88ca5a61a1be5a4890719615bf4ebdf50f6"}
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