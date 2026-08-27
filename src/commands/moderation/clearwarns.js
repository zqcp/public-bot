const {
    PermissionFlagsBits
} = require("discord.js");

const Warning = require("../../models/Warning");
const globalEmbeds = require("../../embeds/global");
const moderationEmbeds = require("../../embeds/help/moderation");

module.exports = {

    name: "clear warns",

    aliases: ["cw", "clear warnings"],

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
                    moderationEmbeds.clearwarns(
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
         * User hierarchy
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
         * Clear warnings
         */

        try {

            const result =
                await Warning.deleteMany({
                    guildId: message.guild.id,
                    userId: member.id
                });

            /*
             * No warnings
             */

            if (!result.deletedCount) {
                return message.channel.send({
                    embeds: [
                        globalEmbeds.regular(
                            `${message.author}: **${member.user.username}** has no warnings to clear.`
                        )
                    ]
                });
            }

            /*
             * Success
             */

            return message.channel.send({
                embeds: [
                    globalEmbeds.success(
                        message.author,
                        "Cleared warnings from",
                        member.user.username,
                        `${result.deletedCount} warning${result.deletedCount === 1 ? "" : "s"}`
                    )
                ]
            });

        } catch (error) {

            console.error(
                "[CLEARWARNS] Failed to clear warnings:",
                error
            );

            return message.channel.send({
                embeds: [
                    globalEmbeds.failed(
                        message.author,
                        "Clear warnings for",
                        member.user.username
                    )
                ]
            });

        }

    }

};
