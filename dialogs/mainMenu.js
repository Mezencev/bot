const menuItems = require('../menu/itemMenu');
module.exports = (bot, builder) => {
  bot.dialog('mainMenu', [
    (session) => {
      builder.Prompts.choice(session, 'Mein Menu:', menuItems);  
    },
    (session, results) => {
      if (results.response) {
        session.beginDialog(menuItems[results.response.entity].item);  
      }  
    }
  ])
  .triggerAction({
    matches: /^main menu$^/i,
    confirmPrompt: 'This will cancel your request. Are you sure?'  
  });
}