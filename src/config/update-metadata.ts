import axios from 'axios';
import config from './metadata.json';

async function main() {
  const keys = [
    'c095a79edcc5d87740063dbd53d18e0cf98ee2129a7509b0883492cca42a517e',
    '62c50fa12beb648089575e9fa8804bcf2534142560eaa6c85bae6783efc664c8',
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
