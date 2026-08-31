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

    name: "vc transfer",

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

        const target =
            message.mentions.members.first() ||
            await message.guild.members.fetch(
                args[0]
            ).catch(() => null);

        if (!target) {

            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(
                            config.colors.error
                        )
                        .setDescription(
                            `${config.emojis.error} ${message.author}: Please specify a **member**.`
                        )
                ]
            });

        }

        if (
            target.id ===
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

        if (
            target.voice.channelId !==
            channel.id
        ) {

            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(
                            config.colors.error
                        )
                        .setDescription(
                            `${config.emojis.error} ${message.author}: ${target} must be in your **voice channel** to receive ownership.`
                        )
                ]
            });

        }

        try {

            data.ownerId =
                target.id;

            await data.save();

        } catch (error) {

            console.error(
                "[VC TRANSFER] Failed to transfer ownership:",
                error
            );

            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(
                            config.colors.failed
                        )
                        .setDescription(
                            `${config.emojis.failed} ${message.author}: I couldn't transfer your **voice channel**.`
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
                        `${config.emojis.success} ${message.author}: Transferred your **voice channel** to ${target}.`
                    )
            ]
        });

    }

};
