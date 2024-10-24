import axios from 'axios';
import config from './metadata.json';

async function main() {
  const keys = [
    'c2addc1063b2fbde63414f268f1a6f1378d7780cc8fc2130b1b0210d7ad64612',
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
