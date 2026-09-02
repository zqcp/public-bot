// src/models/VCConfig.js

const mongoose =
    require("mongoose");


const VCConfigSchema =
    new mongoose.Schema({

        guildId: {
            type: String,
            required: true,
            unique: true
        },

        rankChannelId: {
            type: String,
            default: null
        }

    }, {

        timestamps: true

    });


module.exports =
    mongoose.model(
        "VCConfig",
        VCConfigSchema
    );
