require("dotenv").config();

const Discord = require("discord.js");
const CommandHandler = require("./command-Handler");

const bot = new Discord.Client();
bot.login(process.env.token);

const PREFIX = "--";

bot.on("ready", () => {
  console.log("This bot is online");
});

const queue = new Map();

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
  serverCommandQueue = queue.get(message.guild.id);
  if (!serverCommandQueue) {
    serverCommandQueue = [];
    serverCommandQueue.push({
      commandName: commandName,
      message: message,
      args: args,
    });
    queue.set(message.guild.id, serverCommandQueue);
    return handle_commands(message.guild);
  } else {
    serverCommandQueue.push({
      commandName: commandName,
      message: message,
      args: args,
    });
  }
});

handle_commands = (guild) => {
  serverCommandQueue = queue.get(guild.id);
  console.log("Processing", serverCommandQueue[0].commandName);
  if (
    !CommandHandler.handle_command(
      serverCommandQueue[0].commandName,
      serverCommandQueue[0].message,
      serverCommandQueue[0].args
    )
  )
    serverCommandQueue[0].message.channel.send("Invalid command");
  serverCommandQueue.shift();
  if (serverCommandQueue.length == 0) queue.delete(guild.id);
  else return handle_commands(guild);
};
