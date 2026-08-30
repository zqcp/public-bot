const { EmbedBuilder } = require("discord.js");
const config = require("../config");

module.exports = {

    channelNotFound(user) {
        return new EmbedBuilder()
            .setColor(config.colors.error)
            .setDescription(
                `${config.emojis.error} ${user}: I couldn't find that channel.`
            );
    },


    embedNotFound(user, name) {
        return new EmbedBuilder()
            .setColor(config.colors.error)
            .setDescription(
                `${config.emojis.error} ${user}: I couldn't find the embed **${name}**.`
            );
    },


    noChannel(user) {
        return new EmbedBuilder()
            .setColor(config.colors.error)
            .setDescription(
                `${config.emojis.error} ${user}: You haven't set a welcome channel yet.`
            );
    },


    noMessage(user) {
        return new EmbedBuilder()
            .setColor(config.colors.error)
            .setDescription(
                `${config.emojis.error} ${user}: You haven't set a welcome message yet.`
            );
    },


    enabled(user) {
        return new EmbedBuilder()
            .setColor(config.colors.success)
            .setDescription(
                `${config.emojis.success} ${user}: The welcome system has been **enabled**.`
            );
    },


    disabled(user) {
        return new EmbedBuilder()
            .setColor(config.colors.success)
            .setDescription(
                `${config.emojis.success} ${user}: The welcome system has been **disabled**.`
            );
    },


    alreadyEnabled(user) {
        return new EmbedBuilder()
            .setColor(config.colors.error)
            .setDescription(
                `${config.emojis.error} ${user}: The welcome system is already **enabled**.`
            );
    },


    alreadyDisabled(user) {
        return new EmbedBuilder()
            .setColor(config.colors.error)
            .setDescription(
                `${config.emojis.error} ${user}: The welcome system is already **disabled**.`
            );
    },


    channelSet(user, channel) {
        return new EmbedBuilder()
            .setColor(config.colors.success)
            .setDescription(
                `${config.emojis.success} ${user}: Welcome messages will now be sent in ${channel}.`
            );
    },


    messageSet(user, embedName) {
        return new EmbedBuilder()
            .setColor(config.colors.success)
            .setDescription(
                `${config.emojis.success} ${user}: The welcome message has been set to **${embedName}**.`
            );
    }

};
