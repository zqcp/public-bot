const VoiceChannel =
    require("../../models/VoiceChannel");

const VoiceMaster =
    require("../../models/VoiceMaster");

const Voice =
    require("../../embeds/voicemaster/voice");

const {
    EmbedBuilder
} = require("discord.js");

const config =
    require("../../config");

module.exports = {

    name: "vc claim",

    aliases: [],

    async execute(
        client,
        message,
        args
    ) {

        const channel =
            message.member.voice.channel;

        if (!channel) {

            return message.channel.send({
                embeds: [
                    Voice.notConnected(
                        message.author
                    )
                ]
            });

        }

        const vm =
            await VoiceMaster.findOne({
                guildId:
                    message.guild.id
            });

        if (!vm) {

            return message.channel.send({
                embeds: [
                    Voice.notConfigured(
                        message.author
                    )
                ]
            });

        }

        if (
            channel.id === vm.joinToCreateId ||
            channel.id === vm.unmuteId ||
            channel.id === vm.unmute2Id ||
            channel.id === vm.randomId
        ) {

            return message.channel.send({
                embeds: [
                    Voice.systemChannel(
                        message.author
                    )
                ]
            });

        }

        const data =
            await VoiceChannel.findOne({
                guildId:
                    message.guild.id,

                channelId:
                    channel.id
            });

        if (!data) {

            return message.channel.send({
                embeds: [
                    Voice.notOwner(
                        message.author
                    )
                ]
            });

        }

        /*
         * ALREADY OWNER
         */

        if (
            data.ownerId ===
            message.author.id
        ) {

            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(
                            config.colors.error
                        )
                        .setDescription(
                            `${config.emojis.error} ${message.author}: You already own this **voice channel**.`
                        )
                ]
            });

        }

        /*
         * CHANNEL STILL HAS AN OWNER
         */

        if (
            data.ownerId &&
            data.ownerId !==
            message.author.id
        ) {

            const owner =
                await message.guild.members.fetch(
                    data.ownerId
                ).catch(() => null);

            if (owner) {

                return message.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(
                                config.colors.error
                            )
                            .setDescription(
                                `${config.emojis.error} ${message.author}: This **voice channel** is already owned by ${owner}.`
                            )
                    ]
                });

            }

            /*
             * Owner no longer exists.
             * Allow the current member
             * to claim it.
             */

        }

        /*
         * CLAIM
         */

        try {

            data.ownerId =
                message.author.id;

            await data.save();

        } catch (error) {

            console.error(
                "[VC CLAIM] Failed to claim channel:",
                error
            );

            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(
                            config.colors.failed
                        )
                        .setDescription(
                            `${config.emojis.failed} ${message.author}: I couldn't claim this **voice channel**.`
                        )
                ]
            });

        }

        return message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(
                        config.colors.success
                    )
                    .setDescription(
                        `${config.emojis.success} ${message.author}: You now own this **voice channel**.`
                    )
            ]
        });

    }

};
