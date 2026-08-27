const {
    PermissionFlagsBits
} = require("discord.js");

const globalEmbeds = require("../../embeds/global");

module.exports = {

    name: "unlock",

    aliases: ["ul"],

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

        try {

            /*
             * Unlock channel
             */

            await message.channel.permissionOverwrites.edit(
                message.guild.roles.everyone,
                {
                    SendMessages: null
                }
            );

            /*
             * Reaction
             */

            return message.react("🔓");

        } catch (error) {

            console.error(
                "[UNLOCK] Failed to unlock channel:",
                error
            );

            return message.channel.send({
                embeds: [
                    globalEmbeds.failed(
                        message.author,
                        "Unlock",
                        message.channel.name
                    )
                ]
            });

        }

    }

};
