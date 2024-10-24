import axios from 'axios';
import config from './metadata.json';

async function main() {
  const keys = [
    '5325c52e2cac4b62fb8b0f15eb1a72bbedfa494322e3d0842c022f88a98314ad',
  ];

  for (const key of keys) {
    if (config[key] == null) {
      console.log(`config[${key}] is null`);
      continue;
    }
    let response;
    try {
      response = await axios.post(
        `http://0.0.0.0:5001/metadata/${key}`,
        JSON.stringify(config[key]),
      );
      console.log(`${key} ${JSON.stringify(response.data)}`);
    } catch (error) {
      console.log(`error ${key}: ${error.response.data}`);
    }
  }
}

main();
