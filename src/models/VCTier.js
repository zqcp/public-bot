// src/models/VCTier.js

const mongoose =
    require("mongoose");

const VCTierSchema =
    new mongoose.Schema({

        guildId: {
            type: String,
            required: true
        },

        level: {
            type: Number,
            required: true,
            min: 1
        },

        roleId: {
            type: String,
            required: true
        }

    }, {
        timestamps: true
    });


VCTierSchema.index({
    guildId: 1,
    level: 1
}, {
    unique: true
});


module.exports =
    mongoose.model(
        "VCTier",
        VCTierSchema
    );
