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

    name: "vc_reveal",

    type: "button",

    async execute(
        client,
        interaction
    ) {

        if (!interaction.guild) {
            return;
        }

        const channel =
            interaction.member.voice.channel;

        if (!channel) {

            return interaction.reply({
                embeds: [
                    Voice.notConnected(
                        interaction.user
                    )
                ],
                flags: 64
            });

        }

        const vm =
            await VoiceMaster.findOne({
                guildId:
                    interaction.guild.id
            });

        if (!vm) {

            return interaction.reply({
                embeds: [
                    Voice.notConfigured(
                        interaction.user
                    )
                ],
                flags: 64
            });

        }

        if (
            channel.id === vm.joinToCreateId ||
            channel.id === vm.unmuteId ||
            channel.id === vm.unmute2Id ||
            channel.id === vm.randomId
        ) {

            return interaction.reply({
                embeds: [
                    Voice.systemChannel(
                        interaction.user
                    )
                ],
                flags: 64
            });

        }

        const data =
            await VoiceChannel.findOne({
                guildId:
                    interaction.guild.id,

                channelId:
                    channel.id
            });

        if (!data) {

            return interaction.reply({
                embeds: [
                    Voice.notOwner(
                        interaction.user
                    )
                ],
                flags: 64
            });

        }

        if (
            data.ownerId !==
            interaction.user.id
        ) {

            return interaction.reply({
                embeds: [
                    Voice.notOwner(
                        interaction.user
                    )
                ],
                flags: 64
            });

        }

        const everyone =
            channel.permissionOverwrites.cache.get(
                interaction.guild.roles.everyone.id
            );

        if (
            everyone &&
            everyone.deny.has("ViewChannel")
        ) {

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(
                            config.colors.error
                        )
                        .setDescription(
                            `${config.emojis.error} ${interaction.user}: Your **voice channel** is already hidden.`
                        )
                ],
                flags: 64
            });

        }

        try {

            await channel.permissionOverwrites.edit(
                interaction.guild.roles.everyone,
                {
                    ViewChannel: false
                }
            );

            await Channels.move(
                channel,
                vm,
                "private"
            );

        } catch (error) {

            console.error(
                "[VC HIDE BUTTON] Failed to hide channel:",
                error
            );

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(
                            config.colors.failed
                        )
                        .setDescription(
                            `${config.emojis.failed} ${interaction.user}: I couldn't hide your **voice channel**.`
                        )
                ],
                flags: 64
            });

        }

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(
                        config.colors.success
                    )
                    .setDescription(
                        `${config.emojis.success} ${interaction.user}: Your **voice channel** is now hidden.`
                    )
            ],
            flags: 64
        });

    }

};
