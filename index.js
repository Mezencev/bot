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
const bot = new builder.UniversalBot(connector, [
  (session) => {
    session.send('Welcome to the dinner reservation.')
    session.beginDialog('askForDataTime');
  },
  (session, results) => {
    session.dialogData.reservationDate = builder.EntityRecognizer.resolveTime([results.response]);
    session.beginDialog('askForPartySize');
  },
  (session, results) => {
    session.dialogData.partySize = results.response;
    session.beginDialog('askForReserverName');
  },
  (session, results) => {
    session.dialogData.reservationName = results.response;
    session.send(`Reservation confirmed. Reservation details: <br/>Date/Time: ${session.dialogData.reservationDate} <br/>Party size: ${session.dialogData.partySize} <br/>Reservation name: ${session.dialogData.reservationName}`);
    session.endDialog();
  }
]).set('storage', inMemoryStorage)
bot.dialog('askForDataTime', [
  (session) => {
    builder.Prompts.text(session, 'Please provide a reservation date and time (e.g.: June 6th at 5pm)');
  },
  (session, results) => {
    session.endDialogWithResult(results);
  }
])
bot.dialog('askForPartySize', [
  (session) => {
    builder.Prompts.text(session, 'How many people are in your party?');
  },
  (session, results) => {
    session.endDialogWithResult(results);
  }
])
.beginDialogAction('partySizeHelpAction', 'partySizeHelp', { matches: /^help$/i });
bot.dialog('partySizeHelp', (session, args, next) => {
  const msg = 'Party size help: Our restaurant can support party sizes up to 150 members.';
  session.endDialog(msg);
})
bot.dialog('askForReserverName', [
  (session) => {
    builder.Prompts.text(session, 'Who is name will this reservation be under?');
  },
  (session, results) => {
    session.endDialogWithResult(results);
  }
]);


