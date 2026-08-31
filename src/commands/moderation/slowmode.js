const {
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const globalEmbeds = require("../../embeds/global");
const moderationEmbeds = require("../../embeds/help/moderation");
const config = require("../../config");

module.exports = {

    name: "slowmode",

    aliases: ["slow", "sm"],

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
         * Help
         */

        if (!args.length) {
            return message.channel.send({
                embeds: [
                    moderationEmbeds.slowmode(
                        message.author
                    )
                ]
            });
        }

        /*
         * Duration
         */

        const input =
            args.join(" ")
                .toLowerCase()
                .trim();

        const match =
            input.match(
                /^(\d+)\s*(s|sec|secs|second|seconds|m|min|mins|minute|minutes|h|hr|hrs|hour|hours)$/
            );

        if (!match) {
            return message.channel.send({
                embeds: [
                    globalEmbeds.error(
                        `${message.author}: Please provide a valid duration such as \`10s\`, \`5m\`, or \`1h\`.`
                    )
                ]
            });
        }

        const amount =
            Number(match[1]);

        const unit =
            match[2];

        let seconds;

        if (
            [
                "s",
                "sec",
                "secs",
                "second",
                "seconds"
            ].includes(unit)
        ) {

            seconds =
                amount;

        } else if (
            [
                "m",
                "min",
                "mins",
                "minute",
                "minutes"
            ].includes(unit)
        ) {

            seconds =
                amount * 60;

        } else {

            seconds =
                amount * 60 * 60;

        }

        /*
         * Discord slowmode limit
         */

        if (seconds > 21600) {
            return message.channel.send({
                embeds: [
                    globalEmbeds.error(
                        `${message.author}: Slowmode cannot be longer than **6 hours**.`
                    )
                ]
            });
        }

        /*
         * Set slowmode
         */

        try {

            await message.channel.setRateLimitPerUser(
                seconds,
                `Slowmode set by ${message.author.tag}`
            );

        } catch (error) {

            console.error(
                "[SLOWMODE] Failed to set slowmode:",
                error
            );

            /*
             * Failed embed
             */

            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(
                            config.colors.failed
                        )
                        .setDescription(
                            `${config.emojis.failed} ${message.author}: failed slowmode ${message.channel}. Please try again`
                        )
                ]
            });

        }

        /*
         * Success embed
         */

        return message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(
                        config.colors.success
                    )
                    .setDescription(
                        `${config.emojis.success} ${message.author}: Slowmode set to \`${input}\` in ${message.channel}.`
                    )
            ]
        });

    }

};
