const {
    PermissionFlagsBits
} = require("discord.js");

const globalEmbeds =
    require("../../embeds/global");

const welcomeEmbeds =
    require("../../embeds/welcome");

const Welcome =
    require("../../models/Welcome");

module.exports = {

    name: "welcome disable",

    aliases: [],

    permissions: {
        user: ["ManageGuild"],
        bot: ["ManageGuild"]
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
         * Bot permission
         */

        if (
            !message.guild.members.me.permissions.has(
                PermissionFlagsBits.ManageGuild
            )
        ) {

            return message.channel.send({
                embeds: [
                    globalEmbeds.botPermission(
                        message.author,
                        ["ManageGuild"]
                    )
                ]
            });

        }

        /*
         * Get configuration
         */

        const welcome =
            await Welcome.findOne({
                guildId:
                    message.guild.id
            });

        /*
         * Already disabled
         */

        if (
            !welcome ||
            !welcome.enabled
        ) {

            return message.channel.send({
                embeds: [
                    welcomeEmbeds.alreadyDisabled(
                        message.author
                    )
                ]
            });

        }

        /*
         * Disable
         */

        try {

            await Welcome.findOneAndUpdate(
                {
                    guildId:
                        message.guild.id
                },
                {
                    $set: {
                        enabled: false
                    }
                },
                {
                    new: true
                }
            );

        } catch (error) {

            console.error(
                "[WELCOME DISABLE]",
                error
            );

            return message.channel.send({
                embeds: [
                    globalEmbeds.error(
                        `${message.author}: I couldn't disable the welcome system.`
                    )
                ]
            });

        }

        /*
         * Success
         */

        return message.channel.send({
            embeds: [
                welcomeEmbeds.disabled(
                    message.author
                )
            ]
        });

    }

};
