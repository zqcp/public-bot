// src/commands/voicemaster/vmreset.js

const {
    EmbedBuilder
} = require("discord.js");

const VoiceMaster =
    require("../../models/VoiceMaster");

const VoiceChannel =
    require("../../models/VoiceChannel");

const globalEmbeds =
    require("../../embeds/global");

const config =
    require("../../config");

module.exports = {

    name: "vmreset",

    aliases: ["voicemaster reset"],

    permissions: {
        user: ["ManageGuild"],
        bot: ["ManageChannels"]
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

        if (!voiceMaster) {

            const embed =
                new EmbedBuilder()
                    .setColor(
                        config.colors.error
                    )
                    .setDescription(
                        `${config.emojis.error} ${message.author}: VoiceMaster hasn't been **set up** in this server.`
                    );

            return message.channel.send({
                embeds: [embed]
            });

        }

        /*
         * Delete interface message
         */

        if (
            voiceMaster.interfaceChannelId &&
            voiceMaster.interfaceMessageId
        ) {

            const interfaceChannel =
                message.guild.channels.cache.get(
                    voiceMaster.interfaceChannelId
                );

            if (interfaceChannel) {

                const interfaceMessage =
                    await interfaceChannel.messages
                        .fetch(
                            voiceMaster.interfaceMessageId
                        )
                        .catch(() => null);

                if (
                    interfaceMessage &&
                    interfaceMessage.deletable
                ) {

                    await interfaceMessage.delete()
                        .catch(() => null);

                }

            }

        }

        /*
         * Find generated VoiceMaster channels
         */

        const generated =
            await VoiceChannel.find({
                guildId:
                    message.guild.id
            });

        /*
         * Delete generated channels
         *
         * Run deletions in parallel so
         * reset completes faster.
         */

        await Promise.all(
            generated.map(
                async data => {

                    const channel =
                        message.guild.channels.cache.get(
                            data.channelId
                        );

                    if (
                        channel &&
                        channel.deletable
                    ) {

                        await channel.delete()
                            .catch(() => null);

                    }

                }
            )
        );

        /*
         * System channels
         */

        const systemChannelIds =
            new Set([
                voiceMaster.joinToCreateId,
                voiceMaster.unmuteId,
                voiceMaster.unmute2Id,
                voiceMaster.randomId,
                voiceMaster.interfaceChannelId
            ].filter(Boolean));

        /*
         * Delete system channels
         */

        await Promise.all(
            [...systemChannelIds].map(
                async channelId => {

                    const channel =
                        message.guild.channels.cache.get(
                            channelId
                        );

                    if (
                        channel &&
                        channel.deletable
                    ) {

                        await channel.delete()
                            .catch(() => null);

                    }

                }
            )
        );

        /*
         * Delete VoiceMaster category
         */

        const category =
            message.guild.channels.cache.get(
                voiceMaster.defaultCategoryId
            );

        if (
            category &&
            category.deletable
        ) {

            await category.delete()
                .catch(() => null);

        }

        /*
         * Delete database records
         */

        await Promise.all([
            VoiceChannel.deleteMany({
                guildId:
                    message.guild.id
            }),

            VoiceMaster.deleteOne({
                guildId:
                    message.guild.id
            })
        ]);

        /*
         * Success
         */

        const embed =
            new EmbedBuilder()
                .setColor(
                    config.colors.success
                )
                .setDescription(
                    `${config.emojis.success} ${message.author}: VoiceMaster has been **reset**.`
                );

        return message.channel.send({
            embeds: [embed]
        });

    }

};
