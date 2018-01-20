const menuItems = require('../menu/itemMenu');
const dinnerMenu = require('../menu/dinnerMenu');
module.exports = (bot, builder) => {
  bot.dialog('addDinnerItem', [
    (session, args) => {
      if(args && args.reprompt){
          session.send('What else would you like to have for dinner tonight?');
        }
        else {
          session.conversationData.orders = new Array();
          session.conversationData.orders.push({ 
              Description: 'Check out',
              Price: 0
          })
      }
      builder.Prompts.choice(session, 'Dinner menu:', dinnerMenu);
    },
    (session, results) => {
      if(results.response){
          if(results.response.entity.match(/^check out$/i)){
              session.endDialog('Checking out...');
          }
          else {
              var order = dinnerMenu[results.response.entity];
              session.conversationData.orders[0].Price += order.Price; // Add to total.
              var msg = `You ordered: ${order.Description} for a total of $${order.Price}.`;
              session.send(msg);
              session.conversationData.orders.push(order);
              session.replaceDialog('addDinnerItem', { reprompt: true }); // Repeat dinner menu
          }        
        }
    }
  ])
  .reloadAction(
    'restartOrderDinner", "Ok. Let is start over.',
    {
        matches: /^start over$/i
    }
  );
}
