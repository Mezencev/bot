module.exports = (bot, builder) => {
  bot.dialog('scheduleShuttle', [
    (session) => {
      session.send('A shuttle bus from  Airport stops in front of the hotel');
      session.replaceDialog('mainMenu');  
    }  
  ])  
}