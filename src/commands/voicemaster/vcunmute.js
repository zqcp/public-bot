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

    name: "vc unmute",

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
            channel.id ===
            vm.joinToCreateId ||
            channel.id ===
            vm.unmuteId ||
            channel.id ===
            vm.unmute2Id ||
            channel.id ===
            vm.randomId
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


        const isMuted =
            message.member.voice.serverMute;

        const isDeafened =
            message.member.voice.serverDeaf;


        /*
         * ALREADY UNMUTED + UNDEAFENED
         */

        if (
            !isMuted &&
            !isDeafened
        ) {

            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(
                            config.colors.error
                        )
                        .setDescription(
                            `${config.emojis.error} ${message.author}: You're already **server unmuted** and **server undeafened**.`
                        )
                ]
            });

        }


        /*
         * MUTED ONLY
         */

        if (
            isMuted &&
            !isDeafened
        ) {

            try {

                await message.member.voice.setMute(
                    false
                );

            } catch (error) {

                console.error(
                    "[VC UNMUTE] Failed to unmute:",
                    error
                );

                return message.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(
                                config.colors.failed
                            )
                            .setDescription(
                                `${config.emojis.failed} ${message.author}: I couldn't **server unmute** you.`
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
                            `${config.emojis.success} ${message.author}: You are now **server unmuted**.`
                        )
                ]
            });

        }


        /*
         * DEAFENED ONLY
         */

        if (
            !isMuted &&
            isDeafened
        ) {

            try {

                await message.member.voice.setDeaf(
                    false
                );

            } catch (error) {

                console.error(
                    "[VC UNMUTE] Failed to undeafen:",
                    error
                );

                return message.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(
                                config.colors.failed
                            )
                            .setDescription(
                                `${config.emojis.failed} ${message.author}: I couldn't **server undeafen** you.`
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
                            `${config.emojis.success} ${message.author}: You are now **server undeafened**.`
                        )
                ]
            });

        }


        /*
         * MUTED + DEAFENED
         */

        try {

            await message.member.voice.setMute(
                false
            );

            await message.member.voice.setDeaf(
                false
            );

        } catch (error) {

            console.error(
                "[VC UNMUTE] Failed:",
                error
            );

            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(
                            config.colors.failed
                        )
                        .setDescription(
                            `${config.emojis.failed} ${message.author}: I couldn't **server unmute** and **server undeafen** you.`
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
                        `${config.emojis.success} ${message.author}: You are now **server unmuted** and **server undeafened**.`
                    )
            ]
        });

    }

};
