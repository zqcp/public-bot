const {
    PermissionFlagsBits
} = require("discord.js");

const globalEmbeds =
    require("../../embeds/global");

const welcomeEmbeds =
    require("../../embeds/welcome");

const Welcome =
    require("../../models/Welcome");

const welcomeSystem =
    require("../../systems/welcome/welcome");

module.exports = {

    name: "welcome test",

    aliases: [],

    permissions: {
        user: ["ManageGuild"],
        bot: [
            "ManageGuild",
            "ViewChannel",
            "SendMessages",
            "EmbedLinks"
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
         * Configuration
         */

        const welcome =
            await Welcome.findOne({
                guildId:
                    message.guild.id
            });

        /*
         * No channel
         */

        if (!welcome?.channelId) {

            return message.channel.send({
                embeds: [
                    welcomeEmbeds.noChannel(
                        message.author
                    )
                ]
            });

        }

        /*
         * No welcome message
         *
         * The Welcome system can still
         * use its fallback.
         */

        /*
         * Build welcome payload using
         * the current member as the test
         * member.
         */

        let result;

        try {

            result =
                await welcomeSystem.build(
                    message.member
                );

        } catch (error) {

            console.error(
                "[WELCOME TEST]",
                error
            );

            return message.channel.send({
                embeds: [
                    globalEmbeds.error(
                        `${message.author}: I couldn't build the welcome message.`
                    )
                ]
            });

        }

        /*
         * Nothing returned
         */

        if (!result?.payload) {

            return message.channel.send({
                embeds: [
                    globalEmbeds.error(
                        `${message.author}: I couldn't create a welcome message.`
                    )
                ]
            });

        }

        /*
         * Send the test into the
         * current channel instead of
         * the configured welcome channel.
         */

        try {

            await message.channel.send(
                result.payload
            );

        } catch (error) {

            console.error(
                "[WELCOME TEST SEND]",
                error
            );

            return message.channel.send({
                embeds: [
                    globalEmbeds.error(
                        `${message.author}: I couldn't send the welcome test.`
                    )
                ]
            });

        }

    }

};
