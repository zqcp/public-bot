// src/models/Jail.js

const mongoose = require("mongoose");

const jailedMemberSchema =
    new mongoose.Schema(
        {
            userId: {
                type: String,
                required: true
            },

            roles: {
                type: [String],
                default: []
            },

            reason: {
                type: String,
                default: "No reason provided"
            },

            caseNumber: {
                type: Number,
                required: true
            },

            jailedAt: {
                type: Date,
                default: Date.now
            }
        },
        {
            _id: false
        }
    );

const jailSchema =
    new mongoose.Schema(
        {
            guildId: {
                type: String,
                required: true,
                unique: true,
                index: true
            },

            roleId: {
                type: String,
                default: null
            },

            categoryId: {
                type: String,
                default: null
            },

            channelId: {
                type: String,
                default: null
            },

            logChannelId: {
                type: String,
                default: null
            },

            nextCase: {
                type: Number,
                default: 1
            },

            members: {
                type: [jailedMemberSchema],
                default: []
            }
        },
        {
            timestamps: true
        }
    );

module.exports =
    mongoose.model(
        "Jail",
        jailSchema
    );
