const {
    PermissionFlagsBits
} = require("discord.js");

const globalEmbeds = require("../../embeds/global");
const moderationEmbeds = require("../../embeds/help/moderation");

module.exports = {

    name: "timeout",

    aliases: ["to", "mute", "m"],

    permissions: {
        user: ["ModerateMembers"],
        bot: ["ModerateMembers"]
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
                PermissionFlagsBits.ModerateMembers
            )
        ) {
            return message.channel.send({
                embeds: [
                    globalEmbeds.permission(
                        message.author,
                        "Moderate Members"
                    )
                ]
            });
        }

        /*
         * Bot permission
         */

        if (
            !message.guild.members.me.permissions.has(
                PermissionFlagsBits.ModerateMembers
            )
        ) {
            return message.channel.send({
                embeds: [
                    globalEmbeds.botPermission(
                        message.author,
                        ["ModerateMembers"]
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
                    moderationEmbeds.timeout(
                        message.author
                    )
                ]
            });
        }

        /*
         * Find member
         */

        const input = args.shift();

        let member =
            message.mentions.members.first();

        if (!member) {
            try {
                member =
                    await message.guild.members.fetch(input);
            } catch {
                member = null;
            }
        }

        if (!member) {
            return message.channel.send({
                embeds: [
                    globalEmbeds.notFound(
                        message.author
                    )
                ]
            });
        }

        /*
         * Self
         */

        if (member.id === message.author.id) {
            return message.channel.send({
                embeds: [
                    globalEmbeds.self(
                        message.author
                    )
                ]
            });
        }

        /*
         * Server owner
         */

        if (
            member.id === message.guild.ownerId
        ) {
            return message.channel.send({
                embeds: [
                    globalEmbeds.owner(
                        message.author
                    )
                ]
            });
        }

        /*
         * Hierarchy
         */

        if (
            member.roles.highest.position >=
            message.member.roles.highest.position &&
            message.author.id !== message.guild.ownerId
        ) {
            return message.channel.send({
                embeds: [
                    globalEmbeds.hierarchy(
                        message.author
                    )
                ]
            });
        }

        /*
         * Bot hierarchy
         */

        if (
            member.roles.highest.position >=
            message.guild.members.me.roles.highest.position
        ) {
            return message.channel.send({
                embeds: [
                    globalEmbeds.botRole(
                        message.author
                    )
                ]
            });
        }

        /*
         * Duration
         */

        const durationInput = args.shift();

        if (!durationInput) {
            return message.channel.send({
                embeds: [
                    moderationEmbeds.timeout(
                        message.author
                    )
                ]
            });
        }

        const match =
            durationInput
                .toLowerCase()
                .match(
                    /^(\d+)\s*(s|sec|secs|second|seconds|m|min|mins|minute|minutes|h|hr|hrs|hour|hours|d|day|days)$/
                );

        if (!match) {
            return message.channel.send({
                embeds: [
                    globalEmbeds.error(
                        `${message.author}: Please provide a valid duration such as \`10m\`, \`1h\`, or \`7d\`.`
                    )
                ]
            });
        }

        const amount =
            Number(match[1]);

        const unit =
            match[2];

        let milliseconds;

        if (["s", "sec", "secs", "second", "seconds"].includes(unit)) {
            milliseconds = amount * 1000;
        } else if (["m", "min", "mins", "minute", "minutes"].includes(unit)) {
            milliseconds = amount * 60 * 1000;
        } else if (["h", "hr", "hrs", "hour", "hours"].includes(unit)) {
            milliseconds = amount * 60 * 60 * 1000;
        } else {
            milliseconds = amount * 24 * 60 * 60 * 1000;
        }

        /*
         * Discord maximum timeout: 28 days
         */

        const maxTimeout =
            28 * 24 * 60 * 60 * 1000;

        if (
            milliseconds > maxTimeout
        ) {
            return message.channel.send({
                embeds: [
                    globalEmbeds.error(
                        `${message.author}: The maximum timeout duration is **28 days**.`
                    )
                ]
            });
        }

        /*
         * Reason
         */

        const reason =
            args.join(" ").trim() ||
            "No reason provided";

        try {

            await member.timeout(
                milliseconds,
                reason
            );

            /*
             * Success
             */

            return message.channel.send({
                embeds: [
                    globalEmbeds.success(
                        message.author,
                        "Timed out",
                        member.user.username,
                        reason
                    )
                ]
            });

        } catch (error) {

            console.error(
                "[TIMEOUT] Failed to timeout member:",
                error
            );

            return message.channel.send({
                embeds: [
                    globalEmbeds.failed(
                        message.author,
                        "Timeout",
                        member.user.username
                    )
                ]
            });

        }

    }

};
