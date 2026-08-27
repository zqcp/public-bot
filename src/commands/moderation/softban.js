const {
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const globalEmbeds = require("../../embeds/global");
const moderationEmbeds = require("../../embeds/help/moderation");
const config = require("../../config");

module.exports = {

    name: "softban",

    aliases: ["sb"],

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
         * Target
         */

        const targetInput = args.shift();

        if (!targetInput) {
            return message.channel.send({
                embeds: [
                    moderationEmbeds.softban(
                        message.author
                    )
                ]
            });
        }

        /*
         * Resolve target
         */

        let target = null;

        try {

            const id =
                targetInput.replace(/[<@!>]/g, "");

            /*
             * ID
             */

            if (/^\d{17,20}$/.test(id)) {

                target =
                    await message.guild.members
                        .fetch(id)
                        .catch(() => null);
            }

            /*
             * Mention
             */

            if (!target) {
                target =
                    message.mentions.members.first() || null;
            }

            /*
             * Username
             */

            if (!target) {

                const members =
                    await message.guild.members
                        .fetch({
                            query: targetInput,
                            limit: 10
                        })
                        .catch(() => []);

                target =
                    members.find(
                        member =>
                            member.user.username
                                .toLowerCase() ===
                            targetInput.toLowerCase()
                    ) || null;
            }

        } catch (error) {

            console.error(
                "[SOFTBAN] Failed to resolve target:",
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
         * Not found
         */

        if (!target) {
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

        if (target.id === message.author.id) {
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

        if (target.id === message.guild.ownerId) {
            return message.channel.send({
                embeds: [
                    globalEmbeds.owner(
                        message.author
                    )
                ]
            });
        }

        /*
         * Moderator hierarchy
         */

        if (
            message.member.roles.highest.comparePositionTo(
                target.roles.highest
            ) <= 0
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
            message.guild.members.me.roles.highest.comparePositionTo(
                target.roles.highest
            ) <= 0
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
            args.length
                ? args.join(" ").trim()
                : "No reason provided";

        /*
         * Softban
         *
         * Ban the user, delete recent messages,
         * then immediately unban them.
         */

        try {

            await target.ban({
                reason,
                deleteMessageSeconds: 604800
            });

            await message.guild.members.unban(
                target.id,
                reason
            );

            /*
             * Success embed
             */

            const embed =
                new EmbedBuilder()
                    .setColor(config.colors.success)
                    .setDescription(
                        `${config.emojis.success} ${message.author}: Soft banned **${target.user.username}** for ${reason}.`
                    );

            return message.channel.send({
                embeds: [embed]
            });

        } catch (error) {

            console.error(
                `[SOFTBAN] Failed to softban ${target.user.tag}:`,
                error
            );

            /*
             * Failed embed
             */

            const embed =
                new EmbedBuilder()
                    .setColor(config.colors.failed)
                    .setDescription(
                        `${config.emojis.failed} ${message.author}: Soft ban failed for **${target.user.username}**. Please try again.`
                    );

            return message.channel.send({
                embeds: [embed]
            });
        }

    }

};
