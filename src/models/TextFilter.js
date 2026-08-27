// src/models/TextFilter.js

const {
    Schema,
    model
} = require("mongoose");

const textFilterSchema =
    new Schema(
        {
            guildId: {
                type: String,
                required: true,
                unique: true
            },

            enabled: {
                type: Boolean,
                default: true
            },

            words: {
                type: [String],
                default: []
            }
        },
        {
            timestamps: true
        }
    );

module.exports =
    model(
        "TextFilter",
        textFilterSchema
    );
