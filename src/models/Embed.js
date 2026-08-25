const mongoose = require("mongoose");

const EmbedSchema = new mongoose.Schema(
    {
        guildId: {
            type: String,
            required: true,
            index: true
        },

        name: {
            type: String,
            required: true
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

        messages: {
            type: [
                {
                    channelId: {
                        type: String,
                        required: true
                    },

                    messageId: {
                        type: String,
                        required: true
                    }
                }
            ],

            default: []
        }
    },

    {
        timestamps: true
    }
);

EmbedSchema.index(
    {
        guildId: 1,
        name: 1
    },

    {
        unique: true
    }
);

module.exports =
    mongoose.models.Embed ||
    mongoose.model(
        "Embed",
        EmbedSchema
    );
