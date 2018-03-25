require('dotenv').config();
// const axios = require('axios');
const request = require('request-promise-native');

const accessKey = process.env.KEY1_AZURE;
const url = 'https://westcentralus.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment';
const path = process.env.PATH;

(async () => {
  try {
    const params = {
      method: 'POST',
      url,
      path,
      headers: {
        'Ocp-Apim-Subscription-Key': accessKey,
        'Content-Type': 'application/json',
      },
      body: {
        documents: [{ id: '1', language: 'en', text: 'This is bad' }],
      },
      json: true,
    };
    console.log('Params for a request: ', JSON.stringify(params));
    console.log('Requested url:', url);
    const requestResutl = await request.post(url, params);
    console.log('Result: ', JSON.stringify(requestResutl));
  } catch (error) {
    console.error(error);
  }
})();
