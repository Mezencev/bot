//require('dotenv-extended').load();
const builder = require('botbuilder');
const restify = require('restify');
const server = restify.createServer();

server.listen(3978, () => {
  console.log('%s listening to %s', server.name, server.url);
});

const connector = new builder.ChatConnector({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
});

server.post('/api/messages', connector.listen());

const inMemoryStorage = new builder.MemoryBotStorage();
const bot = new builder.UniversalBot(connector, (session) => {
  let msg = 'Welcome to the reservation bot.';
  session.send(msg);
  session.beginDialog('mainMenu');
}).set('storage', inMemoryStorage);

require('./dialogs/mainMenu')(bot, builder);
require('./dialogs/dinnerReservation')(bot, builder);
require('./dialogs/orderDinner')(bot, builder);
require('./dialogs/addDinnerItem')(bot, builder);
