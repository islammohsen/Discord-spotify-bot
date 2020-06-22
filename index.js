require("dotenv").config();

const Discord = require("discord.js");
const CommandHandler = require("./command-Handler");

const bot = new Discord.Client();
bot.login(process.env.token);

const PREFIX = "--";

bot.on("ready", () => {
  console.log("This bot is online");
});

bot.on("message", (message) => {
  if (
    message.content.length < PREFIX.length ||
    message.content.substring(0, PREFIX.length) !== PREFIX
  )
    return;
  let args = message.content
    .substring(PREFIX.length)
    .split(" ")
    .filter((x) => {
      return x != "";
    });
  if (args.length == 0) return;
  console.log(args);
  const commandName = args[0];
  args = args.slice(1);
  if (!CommandHandler.handle_command(commandName, message, args))
    message.reply("Invalid command");
});
