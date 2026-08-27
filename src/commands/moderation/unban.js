const {
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const globalEmbeds = require("../../embeds/global");
const moderationEmbeds = require("../../embeds/help/moderation");
const config = require("../../config");

module.exports = {

    name: "unban",

    aliases: ["ub"],

    permissions: {
        user: ["BanMembers"],
        bot: ["BanMembers"]
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
                PermissionFlagsBits.BanMembers
            )
        ) {
            return message.channel.send({
                embeds: [
                    globalEmbeds.permission(
                        message.author,
                        "Ban Members"
                    )
                ]
            });
        }

        /*
         * Bot permission
         */

        if (
            !message.guild.members.me.permissions.has(
                PermissionFlagsBits.BanMembers
            )
        ) {
            return message.channel.send({
                embeds: [
                    globalEmbeds.botPermission(
                        message.author,
                        ["BanMembers"]
                    )
                ]
            });
        }

        /*
         * User ID
         */

        const targetInput = args.shift();

        if (!targetInput) {
            return message.channel.send({
                embeds: [
                    moderationEmbeds.unban(
                        message.author
                    )
                ]
            });
        }

        const userId =
            targetInput.replace(/[<@!>]/g, "");

        /*
         * Unban requires a user ID.
         */

        if (!/^\d{17,20}$/.test(userId)) {
            return message.channel.send({
                embeds: [
                    globalEmbeds.notFound(
                        message.author
                    )
                ]
            });
        }

        /*
         * Fetch banned user
         */

        let bannedUser;

        try {

            bannedUser =
                await message.guild.bans
                    .fetch(userId)
                    .catch(() => null);

        } catch (error) {

            console.error(
                "[UNBAN] Failed to fetch banned user:",
                error
            );

            return message.channel.send({
                embeds: [
                    globalEmbeds.notFound(
                        message.author
                    )
                ]
            });
        }

        /*
         * User isn't banned
         */

        if (!bannedUser) {
            return message.channel.send({
                embeds: [
                    globalEmbeds.error(
                        `${message.author}: That user is not banned.`
                    )
                ]
            });
        }

        /*
         * Reason
         */

        const reason =
            args.length
                ? args.join(" ").trim()
                : "No reason provided";

        /*
         * Unban
         */

        try {

            await message.guild.members.unban(
                userId,
                reason
            );

            /*
             * Success embed
             */

            const embed =
                new EmbedBuilder()
                    .setColor(config.colors.success)
                    .setDescription(
                        `${config.emojis.success} ${message.author}: Unbanned **${bannedUser.user.username}** for ${reason}.`
                    );

            return message.channel.send({
                embeds: [embed]
            });

        } catch (error) {

            console.error(
                `[UNBAN] Failed to unban ${userId}:`,
                error
            );

            /*
             * Failed embed
             */

            const embed =
                new EmbedBuilder()
                    .setColor(config.colors.failed)
                    .setDescription(
                        `${config.emojis.failed} ${message.author}: Unban failed for **${bannedUser.user.username}**. Please try again.`
                    );

            return message.channel.send({
                embeds: [embed]
            });
        }

    }

};
