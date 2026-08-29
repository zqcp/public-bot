// src/systems/leaderboard/chat.js

const ChatLeaderboard =
    require("../../models/ChatLeaderboard");

const {
    getCycle
} =
    require("./cycle");


/*
 * ============================================================
 * CHAT LEADERBOARD
 * ============================================================
 *
 * Tracks messages for the current weekly leaderboard.
 *
 * The database only stores:
 *
 * guildId
 * userId
 * messages
 *
 * Weekly cleanup is handled by cycle.js.
 *
 * MongoDB $inc is used so this remains efficient on
 * large servers with many messages.
 * ============================================================
 */


/*
 * ============================================================
 * TRACK MESSAGE
 * ============================================================
 */

async function track(
    message
) {

    /*
     * Ignore invalid messages.
     */

    if (
        !message ||
        !message.guild ||
        !message.author ||
        message.author.bot
    ) {

        return false;

    }


    /*
     * Make sure the current weekly cycle is valid.
     *
     * If the bot was offline when the week expired,
     * cycle.js will wipe the old data before we continue.
     */

    try {

        await getCycle(
            message.guild.id
        );

    } catch (error) {

        console.error(
            "[LEADERBOARD CHAT] Failed to check cycle:",
            error
        );

        return false;

    }


    /*
     * Atomically increment the user's message count.
     *
     * upsert creates the record automatically when the
     * user sends their first message of the week.
     */

    try {

        await ChatLeaderboard.findOneAndUpdate(

            {
                guildId:
                    message.guild.id,

                userId:
                    message.author.id
            },

            {
                $inc: {
                    messages: 1
                }
            },

            {
                upsert: true,

                setDefaultsOnInsert: true
            }

        );


        return true;

    } catch (error) {

        /*
         * A duplicate-key race can happen when two messages
         * from a brand-new user arrive at almost exactly
         * the same time.
         *
         * Retry using updateOne.
         */

        if (
            error &&
            error.code === 11000
        ) {

            try {

                await ChatLeaderboard.updateOne(

                    {
                        guildId:
                            message.guild.id,

                        userId:
                            message.author.id
                    },

                    {
                        $inc: {
                            messages: 1
                        }
                    }

                );


                return true;

            } catch (retryError) {

                console.error(
                    "[LEADERBOARD CHAT] Retry failed:",
                    retryError
                );

                return false;

            }

        }


        console.error(
            "[LEADERBOARD CHAT] Failed to record message:",
            error
        );

        return false;

    }

}


/*
 * ============================================================
 * GET TOP
 * ============================================================
 */

async function getTop(
    guildId,
    limit = 10
) {

    if (
        !guildId
    ) {

        return [];

    }


    try {

        /*
         * Make sure an expired weekly cycle is cleaned
         * before reading the leaderboard.
         */

        await getCycle(
            guildId
        );


        const safeLimit =
            Math.max(
                1,
                Math.min(
                    Number(limit) || 10,
                    100
                )
            );


        return await ChatLeaderboard
            .find({
                guildId
            })
            .sort({
                messages: -1
            })
            .limit(
                safeLimit
            )
            .lean();

    } catch (error) {

        console.error(
            "[LEADERBOARD CHAT] Failed to get top users:",
            error
        );

        return [];

    }

}


/*
 * ============================================================
 * GET USER RANK
 * ============================================================
 */

async function getRank(
    guildId,
    userId
) {

    if (
        !guildId ||
        !userId
    ) {

        return null;

    }


    try {

        /*
         * Make sure the weekly cycle is current.
         */

        await getCycle(
            guildId
        );


        const user =
            await ChatLeaderboard
                .findOne({
                    guildId,
                    userId
                })
                .lean();


        /*
         * User has not sent a message during
         * the current leaderboard cycle.
         */

        if (
            !user
        ) {

            return null;

        }


        /*
         * Count how many users have more messages.
         *
         * This gives us the user's position.
         */

        const usersAbove =
            await ChatLeaderboard.countDocuments({

                guildId,

                messages: {
                    $gt:
                        user.messages
                }

            });


        return {

            rank:
                usersAbove + 1,

            messages:
                user.messages || 0

        };

    } catch (error) {

        console.error(
            "[LEADERBOARD CHAT] Failed to get user rank:",
            error
        );

        return null;

    }

}


/*
 * ============================================================
 * RESET GUILD
 * ============================================================
 *
 * This is intentionally available separately so the cycle
 * manager can wipe a guild without knowing anything about
 * how chat statistics work.
 * ============================================================
 */

async function reset(
    guildId
) {

    if (
        !guildId
    ) {

        return false;

    }


    try {

        await ChatLeaderboard.deleteMany({
            guildId
        });


        console.log(
            `[LEADERBOARD CHAT] Reset guild ${guildId}.`
        );


        return true;

    } catch (error) {

        console.error(
            `[LEADERBOARD CHAT] Failed to reset guild ${guildId}:`,
            error
        );


        return false;

    }

}


/*
 * ============================================================
 * EXPORT
 * ============================================================
 */

module.exports = {

    track,

    getTop,

    getRank,

    reset

};
