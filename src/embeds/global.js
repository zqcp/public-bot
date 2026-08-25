const { EmbedBuilder } = require("discord.js");
const config = require("../config");

module.exports = {

    permission(user, permission) {
        return new EmbedBuilder()
            .setColor(config.colors.error)
            .setDescription(
                `${config.emojis.error} ${user}: You're **missing** permission: \`${permission}\`.`
            );
    },


    self(user) {
        return new EmbedBuilder()
            .setColor(config.colors.error)
            .setDescription(
                `${config.emojis.error} ${user}: You can't perform this action on yourself.`
            );
    },


    owner(user) {
        return new EmbedBuilder()
            .setColor(config.colors.error)
            .setDescription(
                `${config.emojis.error} ${user}: You can't perform this action on the server owner.`
            );
    },


    hierarchy(user) {
        return new EmbedBuilder()
            .setColor(config.colors.error)
            .setDescription(
                `${config.emojis.error} ${user}: That member has an equal or higher role than you.`
            );
    },


    botRole(user) {
        return new EmbedBuilder()
            .setColor(config.colors.error)
            .setDescription(
                `${config.emojis.error} ${user}: I can't perform this action because their role is higher than mine.`
            );
    },


    notFound(user) {
        return new EmbedBuilder()
            .setColor(config.colors.error)
            .setDescription(
                `${config.emojis.error} ${user}: I couldn't find that user. Check the username or ID and try again.`
            );
    },


    botPermission(user, permissions) {
        return new EmbedBuilder()
            .setColor(config.colors.error)
            .setDescription(
                `${config.emojis.error} ${user}: I do not have ${permissions
                    .map(permission => `\`${permission}\``)
                    .join(", ")} permissions.`
            );
    },


    success(user, action, username, reason) {
        return new EmbedBuilder()
            .setColor(config.colors.success)
            .setDescription(
                `${config.emojis.success} ${user}: ${action} **${username}** for ${reason || "No reason provided"}.`
            );
    },


    failed(user, action, username) {
        return new EmbedBuilder()
            .setColor(config.colors.failed)
            .setDescription(
                `${config.emojis.failed} ${user}: ${action} failed for **${username}**. Please try again.`
            );
    },


    error(description) {
        return new EmbedBuilder()
            .setColor(config.colors.error)
            .setDescription(
                `${config.emojis.error} ${description}`
            );
    },


    regular(description) {
        return new EmbedBuilder()
            .setColor(config.colors.regular)
            .setDescription(description);
    }

};
