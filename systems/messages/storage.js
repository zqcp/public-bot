const GuildConfig = require("../../models/GuildConfig");

module.exports = {

    async get(guildId) {

        if (!guildId) {
            return null;
        }

        const guildConfig = await GuildConfig.findOne({
            guildId
        });

        if (!guildConfig) {
            return null;
        }

        return guildConfig.messages || {};

    },

    async set(guildId, messages) {

        if (!guildId) {
            return null;
        }

        const guildConfig = await GuildConfig.findOneAndUpdate(
            {
                guildId
            },
            {
                $set: {
                    messages
                }
            },
            {
                new: true,
                upsert: true
            }
        );

        return guildConfig.messages || {};

    },

    async getMessage(guildId, messageId) {

        const messages = await this.get(guildId);

        if (!messages) {
            return null;
        }

        return messages[messageId] || null;

    },

    async setMessage(guildId, messageId, data) {

        if (!guildId || !messageId) {
            return null;
        }

        const messages = await this.get(guildId) || {};

        messages[messageId] = data;

        return this.set(
            guildId,
            messages
        );

    },

    async deleteMessage(guildId, messageId) {

        if (!guildId || !messageId) {
            return false;
        }

        const messages = await this.get(guildId);

        if (!messages || !messages[messageId]) {
            return false;
        }

        delete messages[messageId];

        await this.set(
            guildId,
            messages
        );

        return true;

    }

};
