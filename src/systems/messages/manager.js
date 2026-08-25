const Guild = require("../../models/Guild");

class MessageManager {

    // =====================================================
    // GET GUILD CONFIG
    // =====================================================

    static async getGuild(guildId) {
        if (!guildId) {
            throw new Error("Guild ID is required.");
        }

        return Guild.findOneAndUpdate(
            { guildId },
            {
                $setOnInsert: {
                    guildId
                }
            },
            {
                new: true,
                upsert: true
            }
        );
    }


    // =====================================================
    // GET SAVED MESSAGE
    // =====================================================

    static async get(guildId, type) {
        if (!guildId) {
            throw new Error("Guild ID is required.");
        }

        if (!type) {
            throw new Error("Message type is required.");
        }

        const guild = await this.getGuild(guildId);

        const messages =
            guild.messages || {};

        return messages[type] || null;
    }


    // =====================================================
    // SAVE MESSAGE
    // =====================================================

    static async set(guildId, type, data = {}) {
        if (!guildId) {
            throw new Error("Guild ID is required.");
        }

        if (!type) {
            throw new Error("Message type is required.");
        }

        if (!data || typeof data !== "object") {
            throw new Error("Message data must be an object.");
        }

        const guild = await this.getGuild(guildId);

        if (!guild.messages) {
            guild.messages = {};
        }

        guild.messages[type] = {
            ...data,
            updatedAt: new Date()
        };

        guild.markModified("messages");

        await guild.save();

        return guild.messages[type];
    }


    // =====================================================
    // UPDATE MESSAGE
    // =====================================================

    static async update(guildId, type, data = {}) {
        const current =
            await this.get(guildId, type);

        if (!current) {
            return this.set(
                guildId,
                type,
                data
            );
        }

        return this.set(
            guildId,
            type,
            {
                ...current,
                ...data
            }
        );
    }


    // =====================================================
    // DELETE MESSAGE
    // =====================================================

    static async delete(guildId, type) {
        if (!guildId) {
            throw new Error("Guild ID is required.");
        }

        if (!type) {
            throw new Error("Message type is required.");
        }

        const guild = await this.getGuild(guildId);

        if (!guild.messages) {
            return false;
        }

        if (!guild.messages[type]) {
            return false;
        }

        delete guild.messages[type];

        guild.markModified("messages");

        await guild.save();

        return true;
    }


    // =====================================================
    // CHECK MESSAGE
    // =====================================================

    static async has(guildId, type) {
        const message =
            await this.get(
                guildId,
                type
            );

        return Boolean(message);
    }


    // =====================================================
    // GET ALL MESSAGES
    // =====================================================

    static async all(guildId) {
        const guild =
            await this.getGuild(guildId);

        return guild.messages || {};
    }


    // =====================================================
    // SAVE DISCORD MESSAGE INFO
    // =====================================================

    static async saveDiscordMessage(
        guildId,
        type,
        message,
        configuration = {}
    ) {
        if (!message) {
            throw new Error(
                "A Discord message is required."
            );
        }

        return this.set(
            guildId,
            type,
            {
                ...configuration,

                channelId:
                    message.channelId,

                messageId:
                    message.id,

                updatedAt:
                    new Date()
            }
        );
    }


    // =====================================================
    // CLEAR DISCORD MESSAGE INFO
    // =====================================================

    static async clearDiscordMessage(
        guildId,
        type
    ) {
        const current =
            await this.get(
                guildId,
                type
            );

        if (!current) {
            return false;
        }

        const updated = {
            ...current
        };

        delete updated.channelId;
        delete updated.messageId;

        return this.set(
            guildId,
            type,
            updated
        );
    }
}


module.exports = MessageManager;
