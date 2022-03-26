/* eslint-disable no-unused-vars */
const { MessageEmbed, CommandInteraction } = require( 'discord.js' );
const { icons } = require('../../structures');
const StickyDB = require("../../structures/schemas/sticky");

module.exports = {
  name: "sticky",
  description: "Sticky Message Management",
  permission: "MANAGE_MESSAGES",
  options: [
    {
      name: "create",
      description: "Creates a new sticky message.",
      type: "SUB_COMMAND",
      options: [
        {
          name: "channel",
          description: "Select the channel you wish to apply the sticky message to.",
          type: "CHANNEL"  ,
          required: true
        },
        {
            name: "threshold",
            description: "Enter the threshold for when the sticky message should be resent.",
            type: "NUMBER",
            required: true,
        },
        {
            name: "text",
            description: "Enter the text you wish to add to the sticky message.",
            type: "STRING",
            required: true,
        },
      ],
    },
    {
      name: "remove",
      description: "Delete sticky messages.",
      type: "SUB_COMMAND",
      options: [
        {
          name: "channel",
          description: "Mention the channel you wish to delete a sticky message from.",
          type: "CHANNEL",
          required: true,
        },
      ],
    },
    {
        name: "list",
        description: "List all sticky messages applied to this server.",
        type: "SUB_COMMAND",
    },
  ],
  /**
   * 
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute (interaction) {
    const { options, member, guildId } = interaction;

    const Embed = new MessageEmbed();
    Embed.setColor(`YELLOW`);

    // Get our values from the interaction;
    const Channel = options.getChannel("channel");
    const Threshold = options.getNumber("threshold");
    const Content = options.getString("text");

    // Check if threshold is below 3, otherwise the code can fail to delete the old sticky due to API response speed.
    if (Threshold < 3) return interaction.reply({ embeds: [Embed.setColor(`RED`).setDescription(`You cannot set the threshold below 3.`)], ephemeral: true })

    try {
      switch(options.getSubcommand()) {
        case "create": 
        StickyDB.findOne({ GuildID: guildId, ChannelID: Channel.id }, async (err, data) => {
          if (err) throw err;
          if(data) {
          return interaction.reply({ embeds: [Embed.setDescription(`${icons.wrong} There is already a sticky message attached to this channel!`)]})
        } else {
            StickyDB.create({
            GuildID: guildId,
            ChannelID: Channel.id,
            Message: Content,
            Threshold: Threshold -1,
            CreatedBy: member.id,
            MessageCount: 0,
          });

         Embed.setDescription(`${icons.correct} Successfully added a sticky message!`)
         Embed.addFields(
            { name: "Channel:", value: `${Channel}`, inline: true },
            { name: "Message Threshold:", value: `${Threshold}`, inline: true },
            { name: "Message:", value: `${Content}` })
        interaction.reply({
          embeds: [Embed], ephemeral: true
        });
        Channel.send({ embeds: [new MessageEmbed().setTitle(`${icons.pinned} Sticky Message`).setDescription(`${Content}`)] }).then(async (stickmsg) => {
          const DB = await StickyDB.findOne({ GuildID: guildId, ChannelID: Channel.id })
          DB.Lastmsg = stickmsg.id;
          DB.save();
        })
        }})
        break;

        case "remove":
        StickyDB.findOne({ GuildID: guildId, ChannelID: Channel.id }, async(err, data) => {
          if (err) throw err;
          if (data) {
            await StickyDB.deleteOne({ GuildID: guildId, ChannelID: Channel.id })
              interaction.reply({ embeds: [Embed.setDescription(`${icons.correct} Successfully deleted the sticky message for ${Channel}`)], ephemeral: true })
          } else {
            interaction.reply({ embeds: [Embed.setDescription(`${icons.wrong} There is no sticky message applied to ${Channel}`)], ephemeral: true })
          }
        })
        break;

        case "list":
        StickyDB.find({ GuildID: guildId }, async (err, data) => {
          if(err) throw err;
          if (!data.length) return interaction.reply({ embeds: [Embed.setDescription(`${icons.wrong} It doesn't seem like this guild has any sticky messages applied.`)], ephemeral: true })
          if(data) {
            Embed.setDescription(`${data.map(
          (w, i) => `**Channel**: <#${w.ChannelID}> (**ID**: ${w.ChannelID})\n**Threshold**: ${w.Threshold +1}\n**Created By**: <@${w.CreatedBy}>\n**Content**: ${w.Message}
          \n`
        ).join(" ")}`)
        interaction.reply({ embeds: [Embed], ephemeral: true })
          }
        })
        break;
      }
    } catch (err) {
      console.log(err)
    }
  },
};
