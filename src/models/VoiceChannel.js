// src/models/VoiceChannel.js

const mongoose = require("mongoose");

const VoiceChannelSchema =
    new mongoose.Schema({

        guildId: {
            type: String,
            required: true,
            index: true
        },

        channelId: {
            type: String,
            required: true,
            unique: true
        },

        ownerId: {
            type: String,
            default: null
        }

    }, {
        timestamps: true
    });

module.exports =
    mongoose.model(
        "VoiceChannel",
        VoiceChannelSchema
    );
