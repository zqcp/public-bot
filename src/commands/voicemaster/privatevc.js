const {
    ChannelType,
    EmbedBuilder
} = require("discord.js");

const VoiceMaster =
    require("../../models/VoiceMaster");

const globalEmbeds =
    require("../../embeds/global");

const config =
    require("../../config");

module.exports = {

    name: "set private category",

    aliases: [],

    permissions: {
        user: ["ManageGuild"]
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
                "ManageGuild"
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
         * Find VoiceMaster setup
         */

        const voiceMaster =
            await VoiceMaster.findOne({
                guildId:
                    message.guild.id
            });

        /*
         * VoiceMaster not configured
         */

        if (!voiceMaster) {

            const embed =
                new EmbedBuilder()
                    .setColor(
                        config.colors.error
                    )
                    .setDescription(
                        `${config.emojis.error} ${message.author}: VoiceMaster hasn't been **enabled** yet.`
                    );

            return message.channel.send({
                embeds: [embed]
            });

        }

        /*
         * Category input
         */

        const input =
            args.join(" ").trim();

        /*
         * No category
         */

        if (!input) {

            const embed =
                new EmbedBuilder()
                    .setColor(
                        config.colors.error
                    )
                    .setDescription(
                        `${config.emojis.error} ${message.author}: Please provide a **category**.`
                    );

            return message.channel.send({
                embeds: [embed]
            });

        }

        /*
         * Resolve category
         *
         * Supports:
         * @mention
         * Category ID
         * Category name
         */

        const category =
            message.mentions.channels.first() ||
            message.guild.channels.cache.get(
                input
            ) ||
            message.guild.channels.cache.find(
                channel =>
                    channel.type ===
                        ChannelType.GuildCategory &&
                    channel.name
                        .toLowerCase() ===
                        input.toLowerCase()
            );

        /*
         * Category not found
         */

        if (
            !category ||
            category.type !==
                ChannelType.GuildCategory
        ) {

            return message.channel.send({
                embeds: [
                    globalEmbeds.notFound(
                        message.author
                    )
                ]
            });

        }

        /*
         * Save private category
         */

        voiceMaster.privateCategoryId =
            category.id;

        await voiceMaster.save();

        /*
         * Success
         */

        const embed =
            new EmbedBuilder()
                .setColor(
                    config.colors.success
                )
                .setDescription(
                    `${config.emojis.success} ${message.author}: Private VoiceMaster category set to **${category.name}**.`
                );

        return message.channel.send({
            embeds: [embed]
        });

    }

};
