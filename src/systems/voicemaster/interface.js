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
            .setURL(
                "https://example.com"
            )
            .setDescription(
                "Use the controls below to manage your voice channel with ease."
            )
            .addFields({
                name: "Quick Commands",
                value:
`> <:vc_reject:1537241549304500315> **[reject](https://example.com)** - ban a member
> <:vc_kick:1537241600650903654> **[kick](https://example.com)** - remove a member
> <:vc_permit:1537242278991630437> **[permit](https://example.com)** - permit users or roles
> <:vc_lock:1537242322285232158> **[lock](https://example.com)** - secure your channel
> <:vc_unlock:1537242360935878797> **[unlock](https://example.com)** - open your channel
> <:vc_transfer:1537242413045776394> **[transfer](https://example.com)** - hand off ownership
> <:vc_claim:1537242443005698118> **[claim](https://example.com)** - claim ownership
> <:vc_unmute:1537242487028977674> **[unmute](https://example.com)** - unmute yourself
> <:vc_rename:1537242538413531279> **[rename](https://example.com)** - rename the channel
> <:vc_limit:1537242633741799435> **[limit](https://example.com)** - adjust the user limit`
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
