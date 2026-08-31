const {
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const globalEmbeds = require("../../embeds/global");
const moderationEmbeds = require("../../embeds/help/moderation");
const config = require("../../config");

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

        const input =
            args.shift();

        let member = null;

        try {

            /*
             * Mention
             */

            member =
                message.mentions.members.first() ||
                null;

            /*
             * ID
             */

            if (!member) {

                const id =
                    input.replace(
                        /[<@!>]/g,
                        ""
                    );

                if (
                    /^\d{17,20}$/.test(id)
                ) {

                    member =
                        await message.guild.members
                            .fetch(id)
                            .catch(() => null);

                }

            }

            /*
             * Username
             */

            if (!member) {

                const members =
                    await message.guild.members
                        .fetch({
                            query: input,
                            limit: 10
                        })
                        .catch(() => []);

                member =
                    members.find(
                        member =>
                            member.user.username
                                .toLowerCase() ===
                            input.toLowerCase()
                    ) || null;

            }

        } catch (error) {

            console.error(
                "[UNTIMEOUT] Failed to resolve member:",
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

        if (
            member.id ===
            message.author.id
        ) {

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
            member.id ===
            message.guild.ownerId
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
            message.author.id !==
            message.guild.ownerId
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

        /*
         * Remove timeout
         */

        try {

            await member.timeout(
                null,
                reason
            );

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
                            `${config.emojis.success} ${member} is now **unmuted**.`
                        )
                ]
            });

        } catch (error) {

            console.error(
                "[UNTIMEOUT] Failed to remove timeout:",
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
                            `${config.emojis.failed} ${message.author}: failed untimeout ${member}. Please try again`
                        )
                ]
            });

        }

    }

};
