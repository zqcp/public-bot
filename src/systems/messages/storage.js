const MessageManager = require("./manager");

class MessageStorage {

    // =====================================================
    // GET
    // =====================================================

    static async get(guildId, type) {
        return MessageManager.get(
            guildId,
            type
        );
    }


    // =====================================================
    // SET
    // =====================================================

    static async set(
        guildId,
        type,
        configuration = {}
    ) {
        return MessageManager.set(
            guildId,
            type,
            configuration
        );
    }


    // =====================================================
    // UPDATE
    // =====================================================

    static async update(
        guildId,
        type,
        configuration = {}
    ) {
        return MessageManager.update(
            guildId,
            type,
            configuration
        );
    }


    // =====================================================
    // DELETE
    // =====================================================

    static async delete(
        guildId,
        type
    ) {
        return MessageManager.delete(
            guildId,
            type
        );
    }


    // =====================================================
    // EXISTS
    // =====================================================

    static async exists(
        guildId,
        type
    ) {
        return MessageManager.has(
            guildId,
            type
        );
    }


    // =====================================================
    // GET ALL
    // =====================================================

    static async all(guildId) {
        return MessageManager.all(
            guildId
        );
    }


    // =====================================================
    // SAVE DISCORD MESSAGE
    // =====================================================

    static async saveMessage(
        guildId,
        type,
        message,
        configuration = {}
    ) {
        return MessageManager.saveDiscordMessage(
            guildId,
            type,
            message,
            configuration
        );
    }


    // =====================================================
    // CLEAR DISCORD MESSAGE
    // =====================================================

    static async clearMessage(
        guildId,
        type
    ) {
        return MessageManager.clearDiscordMessage(
            guildId,
            type
        );
    }
}


module.exports = MessageStorage;
