const { EmbedBuilder } = require("discord.js");
const config = require("../config");

module.exports = {

    success(user, description) {
        return new EmbedBuilder()
            .setColor(config.colors.success)
            .setDescription(
                `${config.emojis.success} ${user}: ${description}`
            );
    },

    failed(user, description) {
        return new EmbedBuilder()
            .setColor(config.colors.failed)
            .setDescription(
                `${config.emojis.failed} ${user}: ${description}`
            );
    },

    error(user, description) {
        return new EmbedBuilder()
            .setColor(config.colors.error)
            .setDescription(
                `${config.emojis.error} ${user}: ${description}`
            );
    },

    regular(user, description) {
        return new EmbedBuilder()
            .setColor(config.colors.regular)
            .setDescription(
                `${config.emojis.success} ${user}: ${description}`
            );
    }

};
