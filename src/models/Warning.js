// src/models/Warning.js

const {
    Schema,
    model
} = require("mongoose");

const warningSchema =
    new Schema(
        {
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

            moderatorId: {
                type: String,
                required: true
            },

            reason: {
                type: String,
                default: "No reason provided"
            }
        },
        {
            timestamps: true
        }
    );

module.exports =
    model(
        "Warning",
        warningSchema
    );
