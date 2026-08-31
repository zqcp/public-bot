const VoiceChannel =
    require("../../models/VoiceChannel");

const VoiceMaster =
    require("../../models/VoiceMaster");

const Voice =
    require("../../embeds/voicemaster/voice");

module.exports = async function getVoiceData(
    interaction
) {

    const channel =
        interaction.member.voice.channel;

    if (!channel) {

        await interaction.reply({
            embeds: [
                Voice.notConnected(
                    interaction.user
                )
            ],
            flags: 64
        });

        return null;

    }

    const vm =
        await VoiceMaster.findOne({
            guildId:
                interaction.guild.id
        });

    if (!vm) {

        await interaction.reply({
            embeds: [
                Voice.notConfigured(
                    interaction.user
                )
            ],
            flags: 64
        });

        return null;

    }

    if (
        channel.id === vm.joinToCreateId ||
        channel.id === vm.unmuteId ||
        channel.id === vm.unmute2Id ||
        channel.id === vm.randomId
    ) {

        await interaction.reply({
            embeds: [
                Voice.systemChannel(
                    interaction.user
                )
            ],
            flags: 64
        });

        return null;

    }

    const data =
        await VoiceChannel.findOne({

            guildId:
                interaction.guild.id,

            channelId:
                channel.id

        });

    if (!data) {

        await interaction.reply({
            embeds: [
                Voice.notOwner(
                    interaction.user
                )
            ],
            flags: 64
        });

        return null;

    }

    if (
        data.ownerId !==
        interaction.user.id
    ) {

        await interaction.reply({
            embeds: [
                Voice.notOwner(
                    interaction.user
                )
            ],
            flags: 64
        });

        return null;

    }

    return {
        channel,
        data,
        vm
    };

};
