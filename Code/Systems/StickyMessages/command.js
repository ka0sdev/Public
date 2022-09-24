const { ChatInputCommandInteraction, PermissionFlagsBits, ApplicationCommandOptionType, EmbedBuilder, Colors } = require('discord.js');
const stickyDB = require('../../../structures/schemas/stickyData');

module.exports = {
    name: "sticky",
    loadName: "Sticky Message System",
    description: "Sticky message management.",
    defaultMemberPermissions: PermissionFlagsBits.ManageMessages,
    dmPermission: false,
    options: [
        {
            name: "create",
            description: "Create a sticky message.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "channel",
                    description: "The channel to attach the sticky message to.",
                    type: ApplicationCommandOptionType.Channel,
                    required: true
                },
                {
                    name: "threshold",
                    description: "Enter the threshold for when the sticky message should be resent.",
                    type: ApplicationCommandOptionType.Number,
                    required: true
                },
                {
                    name: "text",
                    description: "Enter the text for the sticky message.",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: "title",
                    description: "Enter a optional title for the sticky message to replace \"Sticky Message\".",
                    type: ApplicationCommandOptionType.String,
                    required: false
                },
                {
                    name: "image",
                    description: "Enter a optional image for the sticky message.",
                    type: ApplicationCommandOptionType.String,
                    required: false
                },
            ],
        },
        {
            name: "delete",
            description: "Delete a sticky message.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "channel",
                    description: "The channel to delete the sticky message from.",
                    type: ApplicationCommandOptionType.Channel,
                    required: true
                },
            ],
        },
        {
            name: "list",
            description: "List all sticky messages.",
            type: ApplicationCommandOptionType.Subcommand,
        },
    ],
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} Client
     * @param 
     */
    async execute(interaction, client) {
        const { options, guild, member } = interaction;

        switch (options.getSubcommand()) {
            case "create": {

                // Grab the interaction options.
                const channel = options.getChannel("channel");
                const threshold = options.getNumber("threshold") - 1; // Have to subtract 1, as code counts from 0.
                const text = options.getString("text");
                const title = options.getString("title") || "Sticky Message";
                const image = options.getString("image") || null;

                // Create the sticky message in the database.
                await stickyDB.create({
                    _id: guild.id,
                    channelID: channel.id,
                    message: text,
                    title: `:pushpin: ${title}`,
                    image: image,
                    createdBy: member.id,
                    threshold: threshold,
                    messageCount: 0,
                });

                // Construct the embed.
                const stickyEmbed = new EmbedBuilder()
                    .setTitle(`:pushpin: ${title}`)
                    .setDescription(text)
                    .setColor(Colors.Yellow) // Change this to whatever color you want.
                    .setImage(image);

                // Send the sticky to the specified channel.
                const stickyMessage = await channel.send({ embeds: [stickyEmbed] });
                
                // Update the database with the message ID.
                await stickyDB.findOneAndUpdate({ _id: guild.id, channelID: channel.id }, { lastMessage: stickyMessage.id });

                // Reply to the interaction.
                interaction.reply({
                    content: `Successfully created a sticky message in ${channel.mention}!`,
                    ephemeral: true,
                });

            }
            break;
            case "delete": {

                // Grab the interaction options.
                const channel = options.getChannel("channel");

                // Delete the sticky message from the database.
                await stickyDB.findOneAndDelete({ _id: guild.id, channelID: channel.id });

                // Reply to the interaction.
                interaction.reply({
                    content: `Successfully deleted the sticky message in ${channel.mention}!`,
                    ephemeral: true,
                });

            }
            break;
            case "list": {

                // Define array to store the sticky messages.
                let = stickyList = [];

                // Grab the sticky messages from the database.
                const stickyMessages = await stickyDB.find({ _id: guild.id });
                if (!stickyMessages) return interaction.reply({
                    content: "There are no sticky messages in this server!",
                    ephemeral: true,
                });

                // Construct the embed.
                const stickyEmbed = new EmbedBuilder()
                    .setTitle(`:pushpin: Sticky Messages`)
                    .setColor(Colors.Yellow); // Change this to whatever color you want.

                // Loop through the sticky messages.
                for (const stickyMessage of stickyMessages) {

                    // Get channel name.
                    const channel = guild.channels.cache.get(stickyMessage.channelID);

                    // Get member name.
                    const member = guild.members.cache.get(stickyMessage.createdBy);

                    // Add to array.
                    stickyList.push(
                        { name: `[#${channel.name}](${channel.url}), ${member.user.username}`, value: `${stickyMessage.message}` },
                    )
                }
                // Add the fields to the embed.
                stickyEmbed.addFields(stickyList);

                // Reply to the interaction.
                interaction.reply({
                    embeds: [stickyEmbed],
                    ephemeral: true,
                });
            }
            break;
        }
    },
}