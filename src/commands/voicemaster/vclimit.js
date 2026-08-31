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

    name: "vc limit",

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

        if (
            data.ownerId !==
            message.author.id
        ) {

            return message.channel.send({
                embeds: [
                    Voice.notOwner(
                        message.author
                    )
                ]
            });

        }

        const limit =
            Number(
                args[0]
            );

        if (
            !args[0] ||
            !Number.isInteger(limit) ||
            limit < 0 ||
            limit > 99
        ) {

            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(
                            config.colors.error
                        )
                        .setDescription(
                            `${config.emojis.error} ${message.author}: Please specify a **limit** between **0** and **99**.`
                        )
                ]
            });

        }

        if (
            channel.userLimit ===
            limit
        ) {

            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(
                            config.colors.error
                        )
                        .setDescription(
                            `${config.emojis.error} ${message.author}: Your **voice channel** already has a limit of **${limit}**.`
                        )
                ]
            });

        }

        try {

            await channel.setUserLimit(
                limit
            );

        } catch (error) {

            console.error(
                "[VC LIMIT] Failed to change channel limit:",
                error
            );

            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(
                            config.colors.failed
                        )
                        .setDescription(
                            `${config.emojis.failed} ${message.author}: I couldn't change your **voice channel** limit.`
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
                        `${config.emojis.success} ${message.author}: Set your **voice channel** limit to **${limit}**.`
                    )
            ]
        });

    }

};
