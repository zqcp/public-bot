const mongoose = require("mongoose");

const VoiceMasterSchema =
    new mongoose.Schema({

        guildId: {
            type: String,
            required: true,
            unique: true
        },

        defaultCategoryId: {
            type: String,
            default: null
        },

        joinToCreateId: {
            type: String,
            default: null
        },

        unmuteId: {
            type: String,
            default: null
        },

        unmute2Id: {
            type: String,
            default: null
        },

        randomId: {
            type: String,
            default: null
        },

        publicCategoryId: {
            type: String,
            default: null
        },

        privateCategoryId: {
            type: String,
            default: null
        },

        interfaceChannelId: {
            type: String,
            default: null
        },

        interfaceMessageId: {
            type: String,
            default: null
        }

    }, {
        timestamps: true
    });

module.exports =
    mongoose.model(
        "VoiceMaster",
        VoiceMasterSchema
    );
