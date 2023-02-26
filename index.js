const Discord = require('discord.js');
const client = new Discord.Client({partials: ["MESSAGE", "USER", "REACTION"]});
const enmap = require('enmap');
const {token, prefix} = require('./config.json');

const settings = new enmap({
    name: "settings",
    autoFetch: true,
    cloneLevel: "deep",
    fetchAll: true
});



client.on("ready", () => {
     function randomStatus() {
     let status = [" l'assistenza di Trieste"] 
  let rstatus = Math.floor(Math.random() * status.length);
     client.user.setActivity(status[rstatus], {type: "PLAYING"});
   }; setInterval(randomStatus, 20000)
  
  console.log('Online.')
})



client.on('message', async message => {
    if(message.author.bot) return;
    if(message.content.indexOf(prefix) !== 0) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if(command == "ticket-setup") {

        let channel = message.mentions.channels.first();
        if(!channel) return message.reply("Uso invalido!");

        let sent = await channel.send(new Discord.MessageEmbed()
            .setTitle("Assistenza di Trieste - FVG")
            .setDescription("Reagisci per aprire un ticket.")
            .setFooter("Trieste - FVG")
            .setColor("00ff00")
        );

        sent.react('🎫');
        settings.set(`${message.guild.id}-ticket`, sent.id);

        message.channel.send("Messaggio setup inviato!")
    }
});

client.on('messageReactionAdd', async (reaction, user) => {
    if(user.partial) await user.fetch();
    if(reaction.partial) await reaction.fetch();
    if(reaction.message.partial) await reaction.message.fetch();

    if(user.bot) return;

    let ticketid = await settings.get(`${reaction.message.guild.id}-ticket`);

    if(!ticketid) return;

    if(reaction.message.id == ticketid && reaction.emoji.name == '🎫') {
        reaction.users.remove(user);

        reaction.message.guild.channels.create(`ticket-${user.username}`, {
            permissionOverwrites: [
                {
                    id: user.id,
                    allow: ["SEND_MESSAGES", "VIEW_CHANNEL"]
                },
                {
                    id: reaction.message.guild.roles.everyone,
                    deny: ["VIEW_CHANNEL"]
                }
            ],
            type: 'text'
        }).then(async channel => {
            channel.send(`<@${user.id}>`, new Discord.MessageEmbed().setTitle("Assistenza di Trieste").setDescription("A breve uno staffer arriverà da te!`").setColor("00ff00"))
          channel.send(`! <@${1076555575288143903}>`)
        })
    }
});

client.login(token);