// src/commands/moderation/clearcmds.js

const {
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const ClearCmds =
    require("../../models/ClearCmds");

const config =
    require("../../config");

const globalEmbeds =
    require("../../embeds/global");

module.exports = {

    name: "clearcmds",

    aliases: [],

    permissions: {
        user: ["ManageGuild"],
        bot: []
    },

    async execute(
        client,
        message,
        args
    ) {

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
                PermissionFlagsBits.ManageGuild
            )
        ) {
            return message.channel.send({
                embeds: [
                    globalEmbeds.permission(
                        message.author,
                        "Manage Server"
                    )
                ]
            });
        }

        /*
         * Option
         */

        const option =
            args[0]?.toLowerCase();

        /*
         * Enable
         */

        if (
            option === "enable"
        ) {

            await ClearCmds.findOneAndUpdate(
                {
                    guildId:
                        message.guild.id,

                    channelId:
                        message.channel.id
                },
                {
                    guildId:
                        message.guild.id,

                    channelId:
                        message.channel.id,

                    enabled: true
                },
                {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true
                }
            );

            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(
                            config.colors.success
                        )
                        .setDescription(
                            `${config.emojis.success} ${message.author}: Command message cleanup has been **enabled** for ${message.channel}.`
                        )
                ]
            });

        }

        /*
         * Disable
         */

        if (
            option === "disable"
        ) {

            await ClearCmds.findOneAndUpdate(
                {
                    guildId:
                        message.guild.id,

                    channelId:
                        message.channel.id
                },
                {
                    guildId:
                        message.guild.id,

                    channelId:
                        message.channel.id,

                    enabled: false
                },
                {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true
                }
            );

            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(
                            config.colors.success
                        )
                        .setDescription(
                            `${config.emojis.success} ${message.author}: Command message cleanup has been **disabled** for ${message.channel}.`
                        )
                ]
            });

        }

        /*
         * Invalid option
         */

        return message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(
                        config.colors.error
                    )
                    .setDescription(
                        `${config.emojis.error} ${message.author}: Use \`${config.prefix}clearcmds enable\` or \`${config.prefix}clearcmds disable\`.`
                    )
            ]
        });

    }

};
