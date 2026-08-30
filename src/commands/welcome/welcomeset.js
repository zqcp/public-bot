const {
    PermissionFlagsBits,
    ChannelType
} = require("discord.js");

const globalEmbeds =
    require("../../embeds/global");

const welcomeEmbeds =
    require("../../embeds/welcome");

const welcomeHelp =
    require("../../embeds/help/welcome");

const Welcome =
    require("../../models/Welcome");

module.exports = {

    name: "welcome set",

    aliases: [],

    permissions: {
        user: ["ManageGuild"],
        bot: []
    },

    async execute(
        client,
        message,
        args
    ) {

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
                PermissionFlagsBits.ManageGuild
            )
        ) {

            return message.channel.send({
                embeds: [
                    globalEmbeds.permission(
                        message.author,
                        "Manage Server"
                    )
                ]
            });

        }

        /*
         * No channel
         *
         * Show help embed.
         */

        if (!args.length) {

            return message.channel.send({
                embeds: [
                    welcomeHelp.set(
                        message.author
                    )
                ]
            });

        }

        /*
         * Resolve channel
         */

        const channel =
            message.mentions.channels.first();

        if (!channel) {

            return message.channel.send({
                embeds: [
                    welcomeEmbeds.channelNotFound(
                        message.author
                    )
                ]
            });

        }

        /*
         * Channel type
         */

        if (
            channel.type !==
            ChannelType.GuildText
        ) {

            return message.channel.send({
                embeds: [
                    globalEmbeds.error(
                        `${message.author}: That isn't a text channel.`
                    )
                ]
            });

        }

        /*
         * Save
         */

        try {

            await Welcome.findOneAndUpdate(
                {
                    guildId:
                        message.guild.id
                },
                {
                    $set: {
                        channelId:
                            channel.id
                    }
                },
                {
                    upsert: true,
                    new: true
                }
            );

        } catch (error) {

            console.error(
                "[WELCOME SET]",
                error
            );

            return message.channel.send({
                embeds: [
                    globalEmbeds.error(
                        `${message.author}: I couldn't save the welcome channel.`
                    )
                ]
            });

        }

        /*
         * Success
         */

        return message.channel.send({
            embeds: [
                welcomeEmbeds.channelSet(
                    message.author,
                    channel
                )
            ]
        });

    }

};
