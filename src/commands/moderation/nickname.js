const {
    PermissionFlagsBits
} = require("discord.js");

const globalEmbeds = require("../../embeds/global");
const moderationEmbeds = require("../../embeds/help/moderation");

module.exports = {

    name: "nick",

    aliases: ["nickname"],

    permissions: {
        user: ["ManageNicknames"],
        bot: ["ManageNicknames"]
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
                PermissionFlagsBits.ManageNicknames
            )
        ) {
            return message.channel.send({
                embeds: [
                    globalEmbeds.permission(
                        message.author,
                        "Manage Nicknames"
                    )
                ]
            });
        }

        /*
         * Bot permission
         */

        if (
            !message.guild.members.me.permissions.has(
                PermissionFlagsBits.ManageNicknames
            )
        ) {
            return message.channel.send({
                embeds: [
                    globalEmbeds.botPermission(
                        message.author,
                        ["ManageNicknames"]
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
                    moderationEmbeds.nick(
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

        /*
         * Username fallback
         */

        if (!member) {
            const username =
                [input, ...args].join(" ").toLowerCase();

            member =
                message.guild.members.cache.find(
                    m =>
                        m.user.username.toLowerCase() ===
                            username ||
                        (m.nickname &&
                            m.nickname.toLowerCase() ===
                                username)
                );

            if (member) {
                args = [];
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
         * Nickname
         */

        const nickname =
            args.join(" ").trim();

        if (!nickname) {
            return message.channel.send({
                embeds: [
                    globalEmbeds.error(
                        `${message.author}: Please provide a nickname.`
                    )
                ]
            });
        }

        /*
         * Maximum nickname length
         */

        if (nickname.length > 32) {
            return message.channel.send({
                embeds: [
                    globalEmbeds.error(
                        `${message.author}: Nicknames cannot be longer than **32 characters**.`
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

        try {

            /*
             * Change nickname
             */

            await member.setNickname(
                nickname,
                `Nickname changed by ${message.author.tag}`
            );

            /*
             * Success
             */

            return message.channel.send({
                embeds: [
                    globalEmbeds.success(
                        message.author,
                        "Changed nickname for",
                        member.user.username,
                        `to **${nickname}**`
                    )
                ]
            });

        } catch (error) {

            console.error(
                "[NICK] Failed to change nickname:",
                error
            );

            return message.channel.send({
                embeds: [
                    globalEmbeds.failed(
                        message.author,
                        "Change nickname for",
                        member.user.username
                    )
                ]
            });

        }

    }

};
