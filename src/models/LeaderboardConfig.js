const {
    Schema,
    model
} = require("mongoose");


const LeaderboardConfigSchema =
    new Schema(
        {

            guildId: {
                type: String,
                required: true,
                unique: true,
                index: true
            },


            /*
             * CHAT LEADERBOARD
             */

            chatChannelId: {
                type: String,
                default: null
            },

            chatMessageId: {
                type: String,
                default: null
            },


            /*
             * VOICE LEADERBOARD
             */

            voiceChannelId: {
                type: String,
                default: null
            },

            voiceMessageId: {
                type: String,
                default: null
            },


            /*
             * WEEKLY CYCLE
             *
             * The cycle is timestamp based.
             * The bot can restart/offline and
             * continue from these timestamps.
             */

            weekStartedAt: {
                type: Date,
                required: true
            },

            nextWipeAt: {
                type: Date,
                required: true
            }

        },
        {
            timestamps: true
        }
    );


module.exports =
    model(
        "LeaderboardConfig",
        LeaderboardConfigSchema
    );
