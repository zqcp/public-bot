const VoiceChannel =
    require("../../models/VoiceChannel");

const VoiceMaster =
    require("../../models/VoiceMaster");

const Channels =
    require("../../systems/voicemaster/channels");

const Voice =
    require("../../embeds/voicemaster/voice");

const {
    EmbedBuilder
} = require("discord.js");

const config =
    require("../../config");

module.exports = {

    name: "vc unlock",

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

        const everyone =
            channel.permissionOverwrites.cache.get(
                message.guild.roles.everyone.id
            );

        if (
            !everyone ||
            !everyone.deny.has("Connect")
        ) {

            const embed =
                new EmbedBuilder()
                    .setColor(
                        config.colors.error
                    )
                    .setDescription(
                        `🔓 ${message.author}: Your **voice channel** is already unlocked.`
                    );

            return message.channel.send({
                embeds: [
                    embed
                ]
            });

        }

        try {

            await channel.permissionOverwrites.edit(
                message.guild.roles.everyone,
                {
                    Connect: null
                }
            );

            await Channels.move(
                channel,
                vm,
                "public"
            );

        } catch (error) {

            console.error(
                "[VC UNLOCK] Failed to unlock channel:",
                error
            );

            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(
                            config.colors.failed
                        )
                        .setDescription(
                            `${config.emojis.failed} ${message.author}: I couldn't unlock your **voice channel**.`
                        )
                ]
            });

        }

        const embed =
            new EmbedBuilder()
                .setColor(
                    config.colors.error
                )
                .setDescription(
                    `🔓 ${message.author}: Your **voice channel** has been unlocked.`
                );

        return message.channel.send({
            embeds: [
                embed
            ]
        });

    }

};
