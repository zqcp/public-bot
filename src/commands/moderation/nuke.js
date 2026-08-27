const {
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const globalEmbeds = require("../../embeds/global");
const config = require("../../config");

module.exports = {

    name: "nuke",

    aliases: ["n"],

    permissions: {
        user: ["ManageChannels"],
        bot: ["ManageChannels"]
    },

    async execute(client, message, args) {

        /*
         * Guild only
         */

        if (!message.guild) {
            return;
        }

        /*
         * User permission
         */

        if (
            !message.member.permissions.has(
                PermissionFlagsBits.ManageChannels
            )
        ) {
            return message.channel.send({
                embeds: [
                    globalEmbeds.permission(
                        message.author,
                        "Manage Channels"
                    )
                ]
            });
        }

        /*
         * Bot permission
         */

        if (
            !message.guild.members.me.permissions.has(
                PermissionFlagsBits.ManageChannels
            )
        ) {
            return message.channel.send({
                embeds: [
                    globalEmbeds.botPermission(
                        message.author,
                        ["ManageChannels"]
                    )
                ]
            });
        }

        /*
         * Save channel information
         */

        const channel = message.channel;
        const position = channel.rawPosition;

        try {

            /*
             * Clone channel
             */

            const newChannel =
                await channel.clone({
                    name: channel.name
                });

            /*
             * Keep same position
             */

            await newChannel.setPosition(position);

            /*
             * Delete old channel
             */

            await channel.delete();

            /*
             * First message
             */

            return newChannel.send({
                content: "First"
            });

        } catch (error) {

            console.error(
                "[NUKE] Failed to nuke channel:",
                error
            );

            /*
             * Failed embed
             */

            if (!channel.deleted) {
                return channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(config.colors.failed)
                            .setDescription(
                                `${config.emojis.failed} ${message.author}: Nuke failed. Please try again.`
                            )
                    ]
                }).catch(() => {});
            }

        }

    }

};
