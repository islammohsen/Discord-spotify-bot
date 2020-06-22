require("dotenv").config();
const spotify = require("./spotify");

const Discord = require("discord.js");

class CommandHandler {
  static isValidCommandName(name) {
    for (var l in this)
      if (
        this.hasOwnProperty(l) &&
        this[l] instanceof Function &&
        l === "onMessage_" + name
      )
        return true;
    return false;
  }
  static handle_command(commandName, message, args) {
    if (this.isValidCommandName(commandName)) {
      this[`onMessage_${commandName}`](message, args);
      return true;
    } else return false;
  }
  static onMessage_ping = (message, args) => {
    message.reply("pong!");
  };
  static onMessage_tophits = async (message, args) => {
    const songs = await spotify.getTopHits();
    message.reply(songs);
  };
}

module.exports = CommandHandler;
