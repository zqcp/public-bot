const mongoose = require("mongoose");

const WelcomeSchema = new mongoose.Schema(
    {
        guildId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        channelId: {
            type: String,
            default: null
        },

        embedName: {
            type: String,
            default: null
        },

        enabled: {
            type: Boolean,
            default: false
        }
    },

    {
        timestamps: true
    }
);

module.exports =
    mongoose.models.Welcome ||
    mongoose.model(
        "Welcome",
        WelcomeSchema
    );
