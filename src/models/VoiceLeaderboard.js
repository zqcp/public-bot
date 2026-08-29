const {
    Schema,
    model
} = require("mongoose");


const VoiceLeaderboardSchema =
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
             * Total voice time for
             * the current leaderboard week.
             *
             * Stored in seconds to avoid
             * unnecessary precision.
             */

            totalSeconds: {
                type: Number,
                default: 0,
                min: 0
            },


            /*
             * Active voice session.
             *
             * If the user is currently in
             * a tracked voice channel, this
             * stores when their session began.
             *
             * If null, they aren't currently
             * being tracked.
             */

            sessionStartedAt: {
                type: Date,
                default: null
            }

        },
        {
            timestamps: true
        }
    );


/*
 * One record per user per guild.
 */

VoiceLeaderboardSchema.index(
    {
        guildId: 1,
        userId: 1
    },
    {
        unique: true
    }
);


/*
 * Optimizes leaderboard ranking queries.
 */

VoiceLeaderboardSchema.index(
    {
        guildId: 1,
        totalSeconds: -1
    }
);


/*
 * Prevent invalid negative values
 * from being saved.
 */

VoiceLeaderboardSchema.pre(
    "save",
    function(next) {

        if (
            this.totalSeconds < 0
        ) {

            this.totalSeconds = 0;

        }

        next();

    }
);


module.exports =
    model(
        "VoiceLeaderboard",
        VoiceLeaderboardSchema
    );
