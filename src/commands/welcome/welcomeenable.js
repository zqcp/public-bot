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

    name: "welcome enable",

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
         * Already enabled
         */

        const welcome =
            await Welcome.findOne({
                guildId:
                    message.guild.id
            });

        if (welcome?.enabled) {

            return message.channel.send({
                embeds: [
                    welcomeEmbeds.alreadyEnabled(
                        message.author
                    )
                ]
            });

        }

        /*
         * Enable
         */

        try {

            await Welcome.findOneAndUpdate(
                {
                    guildId:
                        message.guild.id
                },
                {
                    $set: {
                        enabled: true
                    }
                },
                {
                    upsert: true,
                    new: true
                }
            );

        } catch (error) {

            console.error(
                "[WELCOME ENABLE]",
                error
            );

            return message.channel.send({
                embeds: [
                    globalEmbeds.error(
                        `${message.author}: I couldn't enable the welcome system.`
                    )
                ]
            });

        }

        /*
         * Success
         */

        return message.channel.send({
            embeds: [
                welcomeEmbeds.enabled(
                    message.author
                )
            ]
        });

    }

};
