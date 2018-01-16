//require('dotenv-extended').load();
const builder = require('botbuilder');
const restify = require('restify');
const server = restify.createServer();

server.listen(3978, () => {
    console.log('%s listening to %s', server.name, server.url);
});

var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

server.post('/api/messages', connector.listen());

const bot = new builder.UniversalBot(connector, (session) => {
    session.send('you said: %s', session.message.text);
});