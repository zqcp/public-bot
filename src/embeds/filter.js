// src/embeds/filter.js

const {
    EmbedBuilder
} = require("discord.js");

const config =
    require("../config");

module.exports = {

    enabled(
        user
    ) {

        return new EmbedBuilder()
            .setColor(
                config.colors.success
            )
            .setDescription(
                `${config.emojis.success} ${user}: The **filter** has been enabled.`
            );

    },


    disabled(
        user
    ) {

        return new EmbedBuilder()
            .setColor(
                config.colors.success
            )
            .setDescription(
                `${config.emojis.success} ${user}: The **filter** has been disabled.`
            );

    },


    wordAdded(
        user,
        word
    ) {

        return new EmbedBuilder()
            .setColor(
                config.colors.success
            )
            .setDescription(
                `${config.emojis.success} ${user}: Added \`${word}\` to the filter.`
            );

    },


    wordAlreadyAdded(
        user,
        word
    ) {

        return new EmbedBuilder()
            .setColor(
                config.colors.error
            )
            .setDescription(
                `${config.emojis.error} ${user}: \`${word}\` is already filtered.`
            );

    },


    wordRemoved(
        user,
        word
    ) {

        return new EmbedBuilder()
            .setColor(
                config.colors.success
            )
            .setDescription(
                `${config.emojis.success} ${user}: Removed \`${word}\` from the filter.`
            );

    },


    wordNotFound(
        user,
        word
    ) {

        return new EmbedBuilder()
            .setColor(
                config.colors.error
            )
            .setDescription(
                `${config.emojis.error} ${user}: \`${word}\` isn't in the filter.`
            );

    },


    reset(
        user
    ) {

        return new EmbedBuilder()
            .setColor(
                config.colors.success
            )
            .setDescription(
                `${config.emojis.success} ${user}: The filter words have been **reset**.`
            );

    },


    list(
        user,
        words
    ) {

        return new EmbedBuilder()
            .setColor(
                config.colors.regular
            )
            .setDescription(
                `Filtered words:\n\n${
                    words.length
                        ? words
                            .map(
                                word =>
                                    `• ||${word}||`
                            )
                            .join("\n")
                        : "No filtered words."
                }`
            );

    }

};
