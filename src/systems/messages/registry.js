const Embed = require("../../models/Embed");

module.exports = {

    async get(guildId, name) {

        if (!guildId || !name) {
            return [];
        }

        const embed =
            await Embed.findOne({
                guildId,
                name
            });

        if (
            !embed ||
            !Array.isArray(embed.messages)
        ) {
            return [];
        }

        return embed.messages;

    },

    async add(
        guildId,
        name,
        channelId,
        messageId
    ) {

        if (
            !guildId ||
            !name ||
            !channelId ||
            !messageId
        ) {
            return null;
        }

        const embed =
            await Embed.findOne({
                guildId,
                name
            });

        if (!embed) {
            return null;
        }

        if (!Array.isArray(embed.messages)) {
            embed.messages = [];
        }

        const exists =
            embed.messages.some(
                message =>
                    message.channelId === channelId &&
                    message.messageId === messageId
            );

        if (!exists) {

            embed.messages.push({
                channelId,
                messageId
            });

            await embed.save();

        }

        return embed.messages;

    },

    async remove(
        guildId,
        name,
        channelId,
        messageId
    ) {

        if (!guildId || !name) {
            return false;
        }

        const embed =
            await Embed.findOne({
                guildId,
                name
            });

        if (!embed) {
            return false;
        }

        if (!Array.isArray(embed.messages)) {
            return false;
        }

        const before =
            embed.messages.length;

        embed.messages =
            embed.messages.filter(
                message =>
                    !(
                        message.channelId === channelId &&
                        message.messageId === messageId
                    )
            );

        if (
            embed.messages.length !== before
        ) {

            await embed.save();

            return true;

        }

        return false;

    },

    async clear(
        guildId,
        name
    ) {

        if (!guildId || !name) {
            return false;
        }

        const embed =
            await Embed.findOne({
                guildId,
                name
            });

        if (!embed) {
            return false;
        }

        embed.messages = [];

        await embed.save();

        return true;

    }

};
