const {
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const Warning = require("../../models/Warning");
const globalEmbeds = require("../../embeds/global");
const moderationEmbeds = require("../../embeds/help/moderation");
const config = require("../../config");

module.exports = {

    name: "warnings",

    aliases: ["warns"],

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
                    moderationEmbeds.warnings(
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

        try {

            /*
             * Find warnings
             */

            const warnings =
                await Warning.find({
                    guildId: message.guild.id,
                    userId: member.id
                }).sort({
                    createdAt: -1
                });

            /*
             * No warnings
             */

            if (!warnings.length) {
                return message.channel.send({
                    embeds: [
                        globalEmbeds.regular(
                            `${message.author}: **${member.user.username}** has no warnings.`
                        )
                    ]
                });
            }

            /*
             * Warning embed
             */

            const embed =
                new EmbedBuilder()
                    .setColor(
                        config.colors.regular
                    )
                    .setAuthor({
                        name: member.user.username,
                        iconURL:
                            member.user.displayAvatarURL({
                                dynamic: true
                            })
                    })
                    .setDescription(
                        `**Warnings for ${member.user}**\nTotal warnings: **${warnings.length}**`
                    );

            /*
             * Add warning fields
             */

            warnings
                .slice(0, 10)
                .forEach((warning, index) => {

                    const reason =
                        warning.reason ||
                        "No reason provided";

                    const moderator =
                        `<@${warning.moderatorId}>`;

                    const date =
                        warning.createdAt
                            ? `<t:${Math.floor(
                                new Date(
                                    warning.createdAt
                                ).getTime() / 1000
                            )}:R>`
                            : "Unknown date";

                    embed.addFields({
                        name: `Warning #${index + 1}`,
                        value:
                            `**Reason:** ${reason}\n` +
                            `**Moderator:** ${moderator}\n` +
                            `**Date:** ${date}`,
                        inline: false
                    });

                });

            return message.channel.send({
                embeds: [embed]
            });

        } catch (error) {

            console.error(
                "[WARNINGS] Failed to fetch warnings:",
                error
            );

            return message.channel.send({
                embeds: [
                    globalEmbeds.failed(
                        message.author,
                        "View warnings for",
                        member.user.username
                    )
                ]
            });

        }

    }

};
