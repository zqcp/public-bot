const mongoose = require("mongoose");


// =========================
// ROLE SCHEMA
// =========================

const roleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        roleId: {
            type: String,
            required: true
        }
    },
    {
        _id: false
    }
);


// =========================
// FIELD SCHEMA
// =========================

const fieldSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            maxlength: 256
        },

        value: {
            type: String,
            required: true,
            maxlength: 1024
        },

        inline: {
            type: Boolean,
            default: false
        }
    },
    {
        _id: false
    }
);


// =========================
// EMBED SCHEMA
// =========================

const embedSchema = new mongoose.Schema(
    {

        // =========================
        // BASIC INFO
        // =========================

        guildId: {
            type: String,
            required: true,
            index: true
        },

        creatorId: {
            type: String,
            required: true
        },

        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },


        // =========================
        // SENT MESSAGE
        // =========================

        messageId: {
            type: String,
            default: null
        },

        channelId: {
            type: String,
            default: null
        },


        // =========================
        // EMBED CONTENT
        // =========================

        title: {
            type: String,
            default: "",
            maxlength: 256
        },

        description: {
            type: String,
            default: "",
            maxlength: 4096
        },

        color: {
            type: Number,
            default: 0x3D3D45
        },


        // =========================
        // FOOTER
        // =========================

        footer: {
            text: {
                type: String,
                default: "",
                maxlength: 2048
            },

            iconURL: {
                type: String,
                default: ""
            }
        },


        // =========================
        // AUTHOR
        // =========================

        author: {
            name: {
                type: String,
                default: "",
                maxlength: 256
            },

            iconURL: {
                type: String,
                default: ""
            },

            url: {
                type: String,
                default: ""
            }
        },


        // =========================
        // IMAGE
        // =========================

        image: {
            url: {
                type: String,
                default: ""
            }
        },


        // =========================
        // THUMBNAIL
        // =========================

        thumbnail: {
            url: {
                type: String,
                default: ""
            }
        },


        // =========================
        // FIELDS
        // =========================

        fields: {
            type: [
                fieldSchema
            ],

            default: []
        },


        // =========================
        // CUSTOM ROLES
        // =========================

        roles: {
            type: [
                roleSchema
            ],

            default: []
        }

    },

    {
        timestamps: true
    }
);


// =========================
// INDEX
// =========================

embedSchema.index({
    guildId: 1,
    name: 1
});

embedSchema.index({
    guildId: 1,
    messageId: 1
});


// =========================
// MODEL
// =========================

module.exports =
    mongoose.models.Embed ||
    mongoose.model(
        "Embed",
        embedSchema
    );
