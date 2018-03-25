const restify = require('restify');
const builder = require('botbuilder');

const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
  console.log('%s listening to %s', server.name, server.url);
});

const connector = new builder.ChatConnector({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD,
});

server.post('/api/messages', connector.listen());

const inMemoryStorage = new builder.MemoryBotStorage();
const bot = new builder.UniversalBot(connector);
bot.set('storage', inMemoryStorage);

const luisAppId = process.env.LuisAppId || 'e9a8bce6-f328-40ab-989b-386fcddb0dc';
const luisAPIKey = process.env.LuisAPIKey || '2e582de70bfb41d6b2356367575a4ef6';
const luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = `https://${luisAPIHostName}/luis/v2.0/apps/${luisAppId}7?subscription-key=${luisAPIKey}&verbose=true&timezoneOffset=0&q=`;
const recognizer = new builder.LuisRecognizer(LuisModelUrl);
const intents = new builder.IntentDialog({ recognizers: [recognizer] })
  .matches('Greeting', (session) => {
    console.log(session.message.text);
    console.log(session.message.address.id);
    session.send('You reached Greeting intent, you said \'%s\'.', session.message.text);
  })
  .matches('Help', (session) => {
    session.send('You reached Help intent, you said \'%s\'.', session.message.text);
  })
  .matches('Cancel', (session) => {
    session.send('You reached Cancel intent, you said \'%s\'.', session.message.text);
  })
  .onDefault((session) => {
    session.send('Sorry, I did not understand \'%s\'.', session.message.text);
  });

bot.dialog('/', intents);
