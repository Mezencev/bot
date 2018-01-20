const dinnerMenu = require('../menu/dinnerMenu');  
module.exports = (bot, builder) => {
  bot.dialog('orderDinner', [
      (session) => {
          session.send('Lets order some dinner!');
          session.beginDialog('addDinnerItem');
      },
      (session, results) => {
        if (results.response) {
          for(let i = 1; i < session.conversationData.orders.length; i++){
            session.send(`You ordered: ${session.conversationData.orders[i].Description} for a total of $${session.conversationData.orders[i].Price}.`);
        }
        session.send(`Your total is: $${session.conversationData.orders[0].Price}`);
        builder.Prompts.text(session, "What is your room number?");
        }
      },
      (session, results) => {
        if (results.response) {
          session.dialogData.room = results.response;
          let msg = `Thank you. Your order will be delivered to room #${session.dialogData.room}`;
          session.send(msg);
          session.replaceDialog('mainMenu');
        }
      }
  ])
  .triggerAction({
    matches: /^order dinner$/i,
    confirmPrompt: 'This will cancel your order. Are you sure?'
  })
  .endConversationAction(
    'endOrderDinner', 'Ok. Goodbye.',
    {
        matches: /^cancel$|^goodbye$/i,
        confirmPrompt: 'This will cancel your order. Are you sure?'
    }
  )  
}