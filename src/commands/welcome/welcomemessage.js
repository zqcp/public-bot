const {
    PermissionFlagsBits
} = require("discord.js");

const globalEmbeds =
    require("../../embeds/global");

const welcomeEmbeds =
    require("../../embeds/welcome");

const welcomeHelp =
    require("../../embeds/help/welcome");

const Embed =
    require("../../models/Embed");

const Welcome =
    require("../../models/Welcome");

module.exports = {

    name: "welcome message",

    aliases: [],

    permissions: {
        user: ["ManageGuild"],
        bot: [
            "ManageGuild"
        ]
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
         * No embed name
         *
         * Show help embed.
         */

        if (!args.length) {

            return message.channel.send({
                embeds: [
                    welcomeHelp.message(
                        message.author
                    )
                ]
            });

        }

        /*
         * Embed name
         */

        const embedName =
            args.join(" ").trim();

        /*
         * Find existing embed
         */

        const embed =
            await Embed.findOne({
                guildId:
                    message.guild.id,

                name:
                    embedName
            });

        if (!embed) {

            return message.channel.send({
                embeds: [
                    welcomeEmbeds.embedNotFound(
                        message.author,
                        embedName
                    )
                ]
            });

        }

        /*
         * Save welcome message
         */

        try {

            await Welcome.findOneAndUpdate(
                {
                    guildId:
                        message.guild.id
                },
                {
                    $set: {
                        embedName:
                            embed.name
                    }
                },
                {
                    upsert: true,
                    new: true
                }
            );

        } catch (error) {

            console.error(
                "[WELCOME MESSAGE]",
                error
            );

            return message.channel.send({
                embeds: [
                    globalEmbeds.error(
                        `${message.author}: I couldn't save the welcome message.`
                    )
                ]
            });

        }

        /*
         * Success
         */

        return message.channel.send({
            embeds: [
                welcomeEmbeds.messageSet(
                    message.author,
                    embed.name
                )
            ]
        });

    }

};
