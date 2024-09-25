# Keychat Chat Bot Service

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

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
Message 1 from BotCenter

```json
{
  "id": "id1234",
  "from": "from1253",
  "to": "to123",
  "content": "content123",
  "decryptedDontent": "{\"type\":\"Plain\",\"content\":\"Hi, I am keychat.\"}",
  "createAt": 1234567,
  "sig": "sig123"
}
```
Message 2 from BotCenter

```json
{
  "id": "id1234",
  "from": "from1253",
  "to": "to123",
  "content": "content123",
  "decryptedDontent": "{\"type\":\"Plain\",\"content\":\"Who am I?\"}",
  "createAt": 1234567,
  "sig": "sig123"
}
```

## Fetch models

```
{
  type: 'Command',
  content: '/models'
}
```

json data
```
{
  "id": "id1234",
  "from": "from1253",
  "to": "to123",
  "content": "content123",
  "decryptedDontent": "{\"type\":\"Command\",\"content\":\"/models\"}",
  "createAt": 1234567,
  "sig": "sig123"
}
```

### SelectionAndConfirmPrice
Server side send message

```
{
  type: 'SelectionAndConfirmPrice',
  id: 'SelectModel', // service custom name
  text: 'Please select a model to chat',
  unit: 'sat',
  method: 'ecash',
  data: [
    {
      name: 'gpt-3.5-turbo',
      description: '',
      price: 0,
    },
    {
      name: 'gpt-4',
      description: '',
      price: 1,
    },
  ],
};
```

When user select a option, client will send a message 

```
{
  type: 'SelectionResponse',
  content: 'gpt-4'
  id: 'SelectModel',
}
```

to send json data

```
{
  "id": "id1234",
  "from": "from1253",
  "to": "to123",
  "content": "content123",
  "decryptedDontent": "{\"type\":\"SelectionResponse\",\"content\":\"gpt-4\",\"id\":\"SelectModel\"}",
  "createAt": 1234567,
  "sig": "sig123"
}
```