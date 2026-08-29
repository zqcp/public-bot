const {
    EmbedBuilder
} = require("discord.js");

const config =
    require("../../config");

module.exports = {

    notConnected(
        user
    ) {

        return new EmbedBuilder()
            .setColor(
                config.colors.error
            )
            .setDescription(
                `${config.emojis.error} ${user}: You're not **connected** to a voice channel.`
            );

    },


    notConfigured(
        user
    ) {

        return new EmbedBuilder()
            .setColor(
                config.colors.error
            )
            .setDescription(
                `${config.emojis.error} ${user}: VoiceMaster hasn't been **enabled** yet.`
            );

    },


    systemChannel(
        user
    ) {

        return new EmbedBuilder()
            .setColor(
                config.colors.error
            )
            .setDescription(
                `${config.emojis.error} ${user}: This command can't be used **here**.`
            );

    },


    notOwner(
        user
    ) {

        return new EmbedBuilder()
            .setColor(
                config.colors.error
            )
            .setDescription(
                `${config.emojis.error} ${user}: You don't **own** this voice room.`
            );

    }

};
