const mongoose = require("mongoose");

const GuildConfig = new mongoose.Schema({

    guildId: {
        type: String,
        required: true,
        unique: true
    },

    prefix: {
        type: String,
        default: ","
    },

    vcLive: {
        enabled: {
            type: Boolean,
            default: false
        },

        channelId: {
            type: String,
            default: null
        },

        messageId: {
            type: String,
            default: null
        }
    }

});

module.exports = mongoose.model(
    "GuildConfig",
    GuildConfig
);
