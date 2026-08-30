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

    name: "vc_unlock",

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
            !everyone ||
            !everyone.deny.has("Connect")
        ) {

            const embed =
                new EmbedBuilder()
                    .setColor(
                        config.colors.error
                    )
                    .setDescription(
                        `🔓 ${interaction.user}: Your **voice channel** is already unlocked.`
                    );

            return interaction.reply({
                embeds: [
                    embed
                ],
                flags: 64
            });

        }

        try {

            await channel.permissionOverwrites.edit(
                interaction.guild.roles.everyone,
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
                "[VC UNLOCK BUTTON] Failed to unlock channel:",
                error
            );

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(
                            config.colors.failed
                        )
                        .setDescription(
                            `${config.emojis.failed} ${interaction.user}: I couldn't unlock your **voice channel**.`
                        )
                ],
                flags: 64
            });

        }

        const embed =
            new EmbedBuilder()
                .setColor(
                    config.colors.error
                )
                .setDescription(
                    `🔓 ${interaction.user}: Your **voice channel** has been unlocked.`
                );

        return interaction.reply({
            embeds: [
                embed
            ],
            flags: 64
        });

    }

};
