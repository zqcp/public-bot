const VoiceChannel =
    require("../../models/VoiceChannel");

const VoiceMaster =
    require("../../models/VoiceMaster");

const Voice =
    require("../../embeds/voicemaster/voice");

const VoiceHelp =
    require("../../embeds/help/voice");

const {
    EmbedBuilder
} = require("discord.js");

const config =
    require("../../config");

module.exports = {

    name: "vc reject",

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

        /*
         * HELP
         */

        if (
            !args[0] &&
            !message.mentions.members.first()
        ) {

            return message.channel.send({
                embeds: [
                    VoiceHelp.reject(
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
                            `${config.emojis.error} ${message.author}: You can't **reject** yourself from your **voice channel**.`
                        )
                ]
            });

        }

        const overwrite =
            channel.permissionOverwrites.cache.get(
                target.id
            );

        if (
            overwrite &&
            overwrite.deny.has("Connect") &&
            !overwrite.allow.has("Connect")
        ) {

            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(
                            config.colors.error
                        )
                        .setDescription(
                            `${config.emojis.error} ${message.author}: ${target} is already **rejected** from your **voice channel**.`
                        )
                ]
            });

        }

        try {

            await channel.permissionOverwrites.edit(
                target.id,
                {
                    Connect: false
                }
            );

        } catch (error) {

            console.error(
                "[VC REJECT] Failed to reject member:",
                error
            );

            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(
                            config.colors.failed
                        )
                        .setDescription(
                            `${config.emojis.failed} ${message.author}: I couldn't **reject** ${target} from your **voice channel**.`
                        )
                ]
            });

        }

        if (
            target.voice.channelId ===
            channel.id
        ) {

            await target.voice.setChannel(
                null
            ).catch(() => null);

        }

        return message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(
                        config.colors.success
                    )
                    .setDescription(
                        `${config.emojis.success} ${message.author}: Rejected ${target} from your **voice channel**.`
                    )
            ]
        });

    }

};
