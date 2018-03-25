require('dotenv').config();
const builder = require('botbuilder');
const restify = require('restify');
const https = require('https');
const request = require('request-promise-native');
const axios = require('axios');

const accessKey = process.env.KEY1_AZURE;
const url = process.env.URL_AZURE;
const path = process.env.PATH;
const server = restify.createServer();


server.listen(3978, () => {
  console.log('%s listening to %s', server.name, server.url);
});

const connector = new builder.ChatConnector({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD,
});
server.post('/api/messages', connector.listen());

const inMemoryStorage = new builder.MemoryBotStorage();
const bot = new builder.UniversalBot(connector, (session) => {
  const msg = 'Welcome to the reservation bot.';
  session.send(msg);
  session.beginDialog('mainMenu');
  console.log(session.message.text);
}).set('storage', inMemoryStorage);

require('./dialogs/mainMenu')(bot, builder);
require('./dialogs/dinnerReservation')(bot, builder);
require('./dialogs/orderDinner')(bot, builder);
require('./dialogs/addDinnerItem')(bot, builder);
require('./dialogs/scheduleShuttle')(bot, builder);

request.post(url, {
  method: 'POST',
  path,
  headers: {
    'Ocp-Apim-Subscription-Key': accessKey,
    'Content-Type': 'application/json',
  },
  body: {
    documents: [{ id: '1', language: 'en', text: 'This is bad' }],
  },
  json: true,
})
  .then((response) => {
    console.log(response);
  })
  .catch((error) => {
    console.log(error);
  });

