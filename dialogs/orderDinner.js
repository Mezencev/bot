const dinnerMenu = require('../menu/dinnerMenu');  
module.exports = (bot, builder) => {
  bot.dialog('orderDinner', [
      (session) => {
          session.send('Lets order some dinner!');
          builder.Prompts.choice(session, 'Dinner Menu', dinnerMenu);
      },
      (session, results) => {
        if (results.response) {
          let order = dinnerMenu[results.response.entity];
          let msg = `You ordered: ${order.Description} for a total of $${order.Price}.`;
          session.dialogData.order = order;
          session.send(msg);
          builder.Prompts.text(session, 'What is your room number?');
        }
      },
      (session, results) => {
        if (results.response) {
          session.dialogData.room = results.response;
          let msg = `Thank you. Your order will be delivered to room #${session.dialogData.room}`;
          session.endDialog(msg);
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