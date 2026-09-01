// src/models/VoiceLevel.js

const mongoose =
    require("mongoose");

const VoiceLevelSchema =
    new mongoose.Schema({

        guildId: {
            type: String,
            required: true,
            index: true
        },

        userId: {
            type: String,
            required: true,
            index: true
        },

        allTime: {
            type: Number,
            default: 0
        },

        today: {
            type: Number,
            default: 0
        },

        todayDate: {
            type: String,
            default: ""
        }

    }, {
        timestamps: true
    });


VoiceLevelSchema.index({
    guildId: 1,
    userId: 1
}, {
    unique: true
});


module.exports =
    mongoose.model(
        "VoiceLevel",
        VoiceLevelSchema
    );
