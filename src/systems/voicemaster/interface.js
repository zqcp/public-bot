const {
    EmbedBuilder
} = require("discord.js");

const VoiceMaster =
    require("../../models/VoiceMaster");

const Buttons =
    require("./buttons");

const config =
    require("../../config");


async function update(
    client,
    guild,
    setupChannel
) {

    const vm =
        await VoiceMaster.findOne({
            guildId:
                guild.id
        });


    if (!vm) {
        return;
    }


    const channel =
        setupChannel ||
        guild.channels.cache.get(
            vm.interfaceChannelId
        );


    if (!channel) {
        return;
    }


    let message = null;


    if (
        vm.interfaceMessageId
    ) {

        message =
            await channel.messages.fetch(
                vm.interfaceMessageId
            ).catch(() => null);

    }


    const embed =
        new EmbedBuilder()
            .setTitle(
                "VoiceMaster Interface"
            )
            .setDescription(
                "Use the controls below to manage your voice channel with ease."
            )
            .addFields({
                name: "\u200b",
                value:
`<:vc_lock:1543240964779278439> **Lock** the voice channel
<:vc_unlock:1543240922941235290> **Unlock** the voice channel
<:vc_hide:1543241001705930843> **Hide** the voice channel
<:vc_reveal:1543241065438519306> **Reveal** the voice channel
<:vc_disconnect:1543241366321238026> **Disconnect** a member
<:vc_start:1543241403511996457> **Start** an activity
<:vc_info:1543241450685202452> **View** channel information
<:vc_increase:1543241492884365403> **Increase** the user limit
<:vc_decrease:1543241527780835389> **Decrease** the user limit
<:vc_claim:1543241117779099709> **Claim** the voice channel`
            })
            .setColor(
                config.colors.regular
            );


    const icon =
        guild.iconURL({
            dynamic: true,
            size: 4096
        });


    if (icon) {

        embed.setThumbnail(
            icon
        );

    }


    const components =
        Buttons.create();


    if (message) {

        await message.edit({
            embeds: [embed],
            components
        });

        return;

    }


    const sent =
        await channel.send({
            embeds: [embed],
            components
        });


    vm.interfaceMessageId =
        sent.id;

    vm.interfaceChannelId =
        channel.id;


    await vm.save();

}


module.exports = {
    update
};
