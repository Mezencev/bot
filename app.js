const restify = require('restify');
const builder = require('botbuilder');
const https = require('https');
const request = require('request-promise-native');
const motivation = require('motivation');

const connector = new builder.ChatConnector({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD,
});
const header = { 'Content-Type': 'application/json', 'Ocp-Apim-Subscription-Key': '016f67971f594cd389f0008f5e5b71a8' };
const url = 'https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment';
let task;
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
  console.log('%s listening to %s', server.name, server.url);
});


const bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

bot.on('conversationUpdate', (message) => {
  if (message.membersAdded[0].id === message.address.bot.id) {
    const reply = new builder.Message()
      .address(message.address)
      .text("Hello, I'm careBOTyou! How's your day going?");
    bot.send(reply);
  }
});

async function sendGetSentimentRequest(message) {
  try {
    const params = {
      method: 'POST',
      url,
      headers: header,
      body: {
        documents: [{ id: '1', language: 'en', text: message }],
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
}
bot.dialog('/', (session) => {
  sendGetSentimentRequest(session.message.text).then((parsedBody) => {
    console.log(parsedBody);
    const score = parsedBody.documents[0].score.toString();
    if (score > 0.80) {
	    session.beginDialog('/happy');
    } else if (score > 0.1) {
      session.beginDialog('/stressed');
    } else {
      session.beginDialog('/crisis');
    }
  })
    .catch((err) => {
      console.log(`POST FAILED: ${err}`);
    });
});

bot.dialog('/stressed', [(session) => {
  builder.Prompts.text(session, 'You sound a bit stressed out, how can I help?');
}, (session, results) => {
  switch (stressedCases(session.message.text)) {
    case 1:
      session.send('What do you need to get done?');
      session.replaceDialog('/todo');
      break;
    case 2:
      builder.Prompts.text(session, findAJoke());
      session.endDialog('Hope that cheers you up.');
      break;
    default:
      builder.Prompts.text(session, "Sorry I don't know how to help with that, but I hope this quote will inspire you.");
      session.send(findMotivation());
        // session.send("Your mind will answer most questions if you learn to relax and wait for the answers.  --William S. Burroughs")
  }
}, (session) => {
  session.endDialog('I hope that helped:)');
},
]);

bot.dialog('/todo', [(session) => {
  builder.Prompts.text(session, 'Let me know & I will help you schedule a reminder.');
}, (session, results) => {
  // setTimeout(startReminders(session.message), 2*60*1000);
  task = `${results.response}`;
  setTimeout(() => { startReminders(session.message); }, 5 * 1000);
  session.endDialog(`Ok, I will remind you to do *${results.response}* in 30 minutes.`);
},
]);


bot.dialog('/reminder', [(session) => {
  session.send(`Hello, just want to remind you *${task}*`);
  builder.Prompts.choice(session, 'Would you like me to remind you again?', 'yes|no');
}, (session, results) => {
  console.log(`LOGGING: ${results.response}`);
  if (session.message.text === 'yes') {
    setTimeout(() => { startReminders(session.message); }, 5 * 1000);
    session.endDialog('Ok, I will remind you again in 30 minutes.');
  } else {
    session.endDialog('OK, hope that helped:)');
  }
},
]);


bot.dialog('/crisis', [(session) => {
  let question = '';
  if (session.message.text.includes('suicidal')) {
    question = 'Please call this helpline for support: 1-833-456-4566?';
  } else if (session.message.text.includes('sad')) {
    question = 'I think it would be a good idea to text a friend.';
  } else if (session.message.text.includes('depressed')) {
    question = 'Check out this resource: http://www.bcmhsus.ca/our-services. Consider making an appointment with a professional.';
  } else {
    question = 'Consider reaching out to your family or friends or making an appointment with a professional.';
  }
  builder.Prompts.text(session, question);
}, (session, results) => {
  session.send("Thank you. Remember that you don't have to go through this alone.");
  session.endDialog();
},
]);


bot.dialog('/giphy', [(session) => {
  builder.Prompts.text(session, 'What would you like to see?');
}, (session, results) => {
  getGiphy(results.response).then((gif) => {
    console.log(JSON.parse(gif).data);
    session.send({
      text: 'Here you go!',
      attachments: [
        {
          contentType: 'image/gif',
          contentUrl: JSON.parse(gif).data.images.original.url,
        },
      ],
    });
  }).catch((err) => {
    console.log(`Error getting giphy: ${err}`);
    session.send({
      text: "We couldn't find that unfortunately :(",
      attachments: [
        {
          contentType: 'image/gif',
          contentUrl: 'https://media.giphy.com/media/ToMjGpt4q1nF76cJP9K/giphy.gif',
          name: 'Chicken nugz are life',
        },
      ],
    });
  }).then((idk) => {
    builder.Prompts.text(session, 'Would you like to see more?');
  });
},
function (session, results) {
  if (results.response === 'Yes' || results.response === 'yes') {
    session.beginDialog('/giphy');
  } else {
    session.endDialog('Have a great rest of your day!!!');
  }
},
]);


function startReminders(msg) {
  console.log('SETTING REMINDER');
  bot.beginDialog(msg.address, '/reminder');
}

function stressedCases(message) {
  if (message.includes('todo') || message.includes('homework') || message.includes('work')) {
    return 1;
  } else if (message.includes('joke') || message.includes('funny') || message.includes('sad')) {
    return 2;
  }
  return 0;
}

function findMotivation() {
  const m = motivation.get();
  return m;
}

function findAJoke() {
  switch (Math.floor(Math.random() * 4)) {
    case 0:
      return 'Why aren’t koalas actual bears? They don’t meet the koalafications.';
      break;
    case 1:
      return 'You know why you never see elephants hiding up in trees? Because they’re really good at it.';
      break;
    case 2:
      return 'Two gold fish are in a tank. One looks at the other and says, “You know how to drive this thing?!”';
      break;
    default:
      return 'How does NASA organize a party? They planet.';
      break;
  }
}

