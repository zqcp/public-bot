// src/models/ClearCmds.js

const {
    Schema,
    model
} = require("mongoose");

const ClearCmdsSchema =
    new Schema({

        guildId: {
            type: String,
            required: true
        },

        channelId: {
            type: String,
            required: true
        },

        enabled: {
            type: Boolean,
            default: true
        }

    }, {
        timestamps: false
    });

ClearCmdsSchema.index(
    {
        guildId: 1,
        channelId: 1
    },
    {
        unique: true
    }
);

module.exports =
    model(
        "ClearCmds",
        ClearCmdsSchema
    );
