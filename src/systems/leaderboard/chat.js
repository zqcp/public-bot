// src/systems/leaderboard/chat.js

const ChatLeaderboard =
    require("../../models/ChatLeaderboard");

const {
    getCycle
} =
    require("./cycle");


/*
 * ============================================================
 * CHAT LEADERBOARD TRACKER
 * ============================================================
 *
 * Counts messages per:
 *
 * guild
 * user
 * weekly cycle
 *
 * Uses MongoDB $inc so multiple messages arriving at the
 * same time don't overwrite each other.
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
     * Get / verify the current weekly cycle.
     *
     * This also automatically wipes the guild if the
     * previous cycle expired while the bot was offline.
     */

    let cycle;

    try {

        cycle =
            await getCycle(
                message.guild.id
            );

    } catch (error) {

        console.error(
            "[LEADERBOARD CHAT] Failed to get cycle:",
            error
        );

        return false;

    }


    /*
     * Create the user's record if it doesn't exist.
     *
     * Otherwise increment the existing count.
     *
     * $inc is atomic and safe when many messages arrive
     * simultaneously.
     */

    try {

        await ChatLeaderboard.findOneAndUpdate(

            {
                guildId:
                    message.guild.id,

                userId:
                    message.author.id,

                cycleId:
                    cycle._id.toString()
            },

            {
                $inc: {
                    messages: 1
                }
            },

            {
                upsert: true,

                setDefaultsOnInsert: true,

                new: true
            }

        );

        return true;

    } catch (error) {

        /*
         * Duplicate-key races can occasionally happen
         * during simultaneous upserts because of the unique
         * compound index.
         *
         * Retry once instead of losing the message count.
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
                            message.author.id,

                        cycleId:
                            cycle._id.toString()
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
 * GET TOP USERS
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

        const cycle =
            await getCycle(
                guildId
            );


        return await ChatLeaderboard
            .find({

                guildId,

                cycleId:
                    cycle._id.toString()

            })
            .sort({
                messages: -1
            })
            .limit(
                Math.max(
                    1,
                    Math.min(
                        Number(limit) || 10,
                        100
                    )
                )
            )
            .lean();

    } catch (error) {

        console.error(
            "[LEADERBOARD CHAT] Failed to get leaderboard:",
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

        const cycle =
            await getCycle(
                guildId
            );


        const user =
            await ChatLeaderboard.findOne({

                guildId,

                userId,

                cycleId:
                    cycle._id.toString()

            }).lean();


        if (
            !user
        ) {

            return null;

        }


        const rank =
            await ChatLeaderboard.countDocuments({

                guildId,

                cycleId:
                    cycle._id.toString(),

                messages: {
                    $gt:
                        user.messages
                }

            });


        return {

            rank:
                rank + 1,

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
 * EXPORT
 * ============================================================
 */

module.exports = {

    track,

    getTop,

    getRank

};
