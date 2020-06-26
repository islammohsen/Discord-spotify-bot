require("dotenv").config();
const spotify = require("./spotify");
const Discord = require("discord.js");
const youtube = require("./youtube");
const ytdl = require("ytdl-core");

const queue = new Map();

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
      if (!message.guild.voice || !message.guild.voice.channelID)
        queue.delete(message.guild.id);
      this[`onMessage_${commandName}`](message, args);
      return true;
    } else return false;
  }
  static onMessage_ping = (message, args) => {
    message.reply("pong!");
  };

  static addSongs = async (message, songs) => {
    const serverQueue = queue.get(message.guild.id);
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return message.channel.send(
        "You need to be in a voice channel to play music!"
      );
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return message.channel.send(
        "I need the permissions to join and speak in your voice channel!"
      );
    }

    if (!serverQueue) {
      // Creating the contract for our queue
      const queueContruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true,
      };
      // Setting the queue using our contract
      queue.set(message.guild.id, queueContruct);
      // Pushing the song to our songs array
      for (let i = 0; i < songs.length; i++) {
        const song = songs[i];
        queueContruct.songs.push(song);
      }

      try {
        // Here we try to join the voicechat and save our connection into our object.
        var connection = await voiceChannel.join();
        queueContruct.connection = connection;
        // Calling the play function to start a song
        this.play(message.guild, queueContruct.songs[0]);
      } catch (err) {
        // Printing the error message if the bot fails to join the voicechat
        console.log(err);
        queue.delete(message.guild.id);
        return message.channel.send(err);
      }
    } else {
      for (let i = 0; i < songs.length; i++) {
        const song = songs[i];
        serverQueue.songs.push(song);
      }
    }
  };
  static onMessage_tophits = async (message, args) => {
    let limit = 5;
    if (args.length > 1) return message.channel.send("Invalid arguments");
    if (args.length == 1) {
      limit = parseInt(args[0]);
      if (limit > 50) return message.channel.send("Too many songs");
      if (limit == NaN) return message.channel.send("Invalid arguments");
    }
    let songs = await spotify.getTopHits(limit);
    console.log(songs);
    return this.addSongs(message, songs);
  };

  static onMessage_add = async (message, args) => {
    if (args.length == 0) return message.channel.send("Invalid arguments");
    return this.addSongs(message, [args.join(" ")]);
  };

  static onMessage_queue = async (message, args) => {
    const serverQueue = queue.get(message.guild.id);
    if (serverQueue) {
      console.log(serverQueue);
      if (serverQueue.songs.length == 0)
        return message.channel.send("Queue is empty!");
      else {
        return message.channel.send(serverQueue.songs.join("\n"), {
          split: true,
        });
      }
    } else return message.channel.send("Queue is empty!");
  };

  static play = async (guild, song) => {
    const serverQueue = queue.get(guild.id);
    if (!song) {
      serverQueue.voiceChannel.leave();
      queue.delete(guild.id);
      return;
    }
    const songInfo = await youtube.getVideoInfo(song);
    console.log(songInfo);
    const dispatcher = serverQueue.connection
      .play(ytdl(songInfo.url))
      .on("finish", () => {
        serverQueue.songs.shift();
        this.play(guild, serverQueue.songs[0]);
      })
      .on("error", (error) => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`Start playing: **${songInfo.title}**`);
  };

  static onMessage_skip = (message, args) => {
    const serverQueue = queue.get(message.guild.id);
    if (!message.member.voice.channel)
      return message.channel.send(
        "You have to be in a voice channel to skip the music!"
      );
    if (!serverQueue)
      return message.channel.send("There is no song that I could skip!");
    if (serverQueue.connection.dispatcher)
      serverQueue.connection.dispatcher.end();
    else return message.channel.send("There is no song that I could skip!");
  };

  static onMessage_stop = (message, args) => {
    const serverQueue = queue.get(message.guild.id);
    if (!message.member.voice.channel)
      return message.channel.send(
        "You have to be in a voice channel to stop the music!"
      );
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
  };
}

module.exports = CommandHandler;
