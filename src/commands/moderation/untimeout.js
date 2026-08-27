const {
    PermissionFlagsBits
} = require("discord.js");

const globalEmbeds = require("../../embeds/global");
const moderationEmbeds = require("../../embeds/help/moderation");

module.exports = {

    name: "untimeout",

    aliases: ["uto", "unmute", "unm"],

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
                    moderationEmbeds.untimeout(
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
         * Reason
         */

        const reason =
            args.join(" ").trim() ||
            "No reason provided";

        try {

            await member.timeout(
                null,
                reason
            );

            /*
             * Success
             */

            return message.channel.send({
                embeds: [
                    globalEmbeds.success(
                        message.author,
                        "Removed timeout from",
                        member.user.username,
                        reason
                    )
                ]
            });

        } catch (error) {

            console.error(
                "[UNTIMEOUT] Failed to remove timeout:",
                error
            );

            return message.channel.send({
                embeds: [
                    globalEmbeds.failed(
                        message.author,
                        "Remove timeout from",
                        member.user.username
                    )
                ]
            });

        }

    }

};
