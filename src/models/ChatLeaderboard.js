const {
    Schema,
    model
} = require("mongoose");


const ChatLeaderboardSchema =
    new Schema(
        {

            /*
             * Discord server
             */

            guildId: {
                type: String,
                required: true,
                index: true
            },


            /*
             * Discord user
             */

            userId: {
                type: String,
                required: true,
                index: true
            },


            /*
             * Messages sent during
             * the current leaderboard week.
             */

            messages: {
                type: Number,
                default: 0,
                min: 0
            }

        },
        {
            timestamps: true
        }
    );


/*
 * One leaderboard record per
 * user per guild.
 */

ChatLeaderboardSchema.index(
    {
        guildId: 1,
        userId: 1
    },
    {
        unique: true
    }
);


/*
 * Optimizes leaderboard queries.
 *
 * Finds the highest message counts
 * inside a specific guild.
 */

ChatLeaderboardSchema.index(
    {
        guildId: 1,
        messages: -1
    }
);


module.exports =
    model(
        "ChatLeaderboard",
        ChatLeaderboardSchema
    );
