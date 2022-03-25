const { MessageEmbed } = require("discord.js");
const { icons } = require("../../structures");
const StickyDB = require("../../structures/schemas/sticky");

module.exports = {
  name: "messageCreate",
  /**
   *
   * @param {Message} message
   * @param {Client} client
   */
  async execute(message) {
    const { guildId, channelId } = message;
    if (message.author.bot) return;

    StickyDB.findOne({ GuildID: guildId, ChannelID: channelId }, async (err, data) => {
        if(err) throw err;
        if (data) {
            if (data.MessageCount >= data.Threshold) {
              const Count = await StickyDB.findOne({ GuildID: guildId, ChannelID: channelId });
              Count.MessageCount = 0;
              Count.save();
              const StickyEmbed = new MessageEmbed()
                .setColor(`YELLOW`)
                .setTitle(`${icons.pinned} Sticky Message`)
                .setDescription( `${ data.Message }` )
              message.channel.messages.fetch(data.Lastmsg).then(fetchedMessage => fetchedMessage.delete()).catch(() => null);
              message.channel.send({ embeds: [StickyEmbed] }).then((msg) => {
                Count.Lastmsg = msg.id;
                Count.save();
              })
            } else {
              const Count = await StickyDB.findOne({ GuildID: guildId, ChannelID: channelId });
              Count.MessageCount += 1;
              Count.save();
              return;
            }
        }
    })
  },
};

