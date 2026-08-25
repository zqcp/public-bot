const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
    {
        channelId: {
            type: String,
            default: null
        },

        messageId: {
            type: String,
            default: null
        },

        content: {
            type: String,
            default: null
        },

        embeds: {
            type: mongoose.Schema.Types.Mixed,
            default: []
        },

        components: {
            type: mongoose.Schema.Types.Mixed,
            default: []
        },

        allowedMentions: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },

        flags: {
            type: Number,
            default: 0
        },

        enabled: {
            type: Boolean,
            default: true
        },

        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        _id: false
    }
);


const GuildSchema = new mongoose.Schema(
    {
        // ==========================================
        // SERVER
        // ==========================================

        guildId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },


        // ==========================================
        // SAVED EMBED / MESSAGE CONFIGURATIONS
        // ==========================================

        messages: {
            type: Map,
            of: MessageSchema,
            default: {}
        }
    },
    {
        timestamps: true,
        minimize: false
    }
);


module.exports =
    mongoose.models.Guild ||
    mongoose.model(
        "Guild",
        GuildSchema
    );
