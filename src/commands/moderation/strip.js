const {
    PermissionFlagsBits
} = require("discord.js");

const globalEmbeds = require("../../embeds/global");
const moderationEmbeds = require("../../embeds/help/moderation");

module.exports = {

    name: "strip",

    aliases: ["striproles"],

    permissions: {
        user: ["ManageRoles"],
        bot: ["ManageRoles"]
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
                PermissionFlagsBits.ManageRoles
            )
        ) {
            return message.channel.send({
                embeds: [
                    globalEmbeds.permission(
                        message.author,
                        "Manage Roles"
                    )
                ]
            });
        }

        /*
         * Bot permission
         */

        if (
            !message.guild.members.me.permissions.has(
                PermissionFlagsBits.ManageRoles
            )
        ) {
            return message.channel.send({
                embeds: [
                    globalEmbeds.botPermission(
                        message.author,
                        ["ManageRoles"]
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
                    moderationEmbeds.strip(
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
             * Get removable roles
             */

            const removableRoles =
                member.roles.cache.filter(
                    role =>
                        role.id !== message.guild.id &&
                        !role.managed &&
                        role.position <
                            message.guild.members.me.roles.highest.position
                );

            if (!removableRoles.size) {
                return message.channel.send({
                    embeds: [
                        globalEmbeds.error(
                            `${message.author}: That member has no removable roles.`
                        )
                    ]
                });
            }

            /*
             * Strip roles
             */

            await member.roles.remove(
                removableRoles,
                `Roles stripped by ${message.author.tag}`
            );

            /*
             * Success
             */

            return message.channel.send({
                embeds: [
                    globalEmbeds.success(
                        message.author,
                        "Stripped roles from",
                        member.user.username
                    )
                ]
            });

        } catch (error) {

            console.error(
                "[STRIP] Failed to strip roles:",
                error
            );

            return message.channel.send({
                embeds: [
                    globalEmbeds.failed(
                        message.author,
                        "Strip",
                        member.user.username
                    )
                ]
            });

        }

    }

};
