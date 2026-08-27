const {
    PermissionFlagsBits
} = require("discord.js");

const globalEmbeds = require("../../embeds/global");

module.exports = {

    name: "unhide",

    aliases: ["unhidechannel"],

    permissions: {
        user: ["ManageChannels"],
        bot: ["ManageChannels"]
    },

    async execute(client, message, args) {

        if (!message.guild) {
            return;
        }

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

            await message.channel.permissionOverwrites.edit(
                message.guild.roles.everyone,
                {
                    ViewChannel: null
                }
            );

        } catch (error) {

            console.error(
                "[UNHIDE] Failed to unhide channel:",
                error
            );

            return message.channel.send({
                embeds: [
                    globalEmbeds.failed(
                        message.author,
                        "Unhide",
                        message.channel.name
                    )
                ]
            });

        }

    }

};
