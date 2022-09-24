const { Message, Client, EmbedBuilder, Colors } = require('discord.js');
const stickyDB = require('../../structures/schemas/stickyData');

module.exports = {
    loadName: "stickyMessage Listener",
    name: 'messageCreate',
    /**
     * @param {Message} message
     */
    async execute(message) {
        const { guild, channel, member } = message;
        if (message.author.bot) return;

        // Check if the message is sent in a channel defined as a sticky channel.
        const stickyData = await stickyDB.findOne({ _id: guild.id, channelID: channel.id })
        if (!stickyData) return;

        // Deconstruct the sticky data from database.
        const { message: stickyMessage, threshold, messageCount, lastMessage, image, thumbnail, title } = stickyData;

        // Check if the channel message count is greater than or equal to the threshold,
        // If true, reset messageCount to 0, and update the sticky message in the channel.
        if (messageCount >= threshold) {
            stickyData.messageCount = 0;
            stickyData.save();

            // Construct the embed with our data.
            const stickyEmbed = new EmbedBuilder()
                .setColor(Colors.Yellow) // Change this to whatever color you want.
                .setTitle(':pushpin: Sticky Message') // Default title, this will only be applied if no title is provided.
                .setDescription(`${stickyMessage}`);
            if (title) stickyEmbed.setTitle(title); // If provided, set the embed title.
            if (image) stickyEmbed.setImage(image); // If provided, set the embed image.

            // Fetch the last sticky message sent in the channel and delete it.
            message.channel.messages.fetch(lastMessage).then(fetchedMessage => fetchedMessage.delete()).catch(() => null);

            // Send the new sticky message, and save the message ID to the database.
            message.channel.send({ embeds: [stickyEmbed] }).then((msg) => {
                stickyData.lastMessage = msg.id;
                stickyData.save();
            })
        } else {
            // If the message count is less than the threshold, increment the message count.
            stickyData.messageCount += 1;
            stickyData.save();
            return;
        }
    }
}