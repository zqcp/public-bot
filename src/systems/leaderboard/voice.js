// src/systems/leaderboard/voice.js

const VoiceLeaderboard =
    require("../../models/VoiceLeaderboard");

const {
    getCycle
} =
    require("./cycle");


/*
 * ============================================================
 * VOICE LEADERBOARD
 * ============================================================
 *
 * Tracks voice time for each user per guild.
 *
 * Data:
 *
 * totalSeconds      = completed voice time
 * sessionStartedAt  = currently active voice session
 *
 * The system is designed to survive bot restarts because
 * sessionStartedAt is stored in MongoDB.
 * ============================================================
 */


/*
 * ============================================================
 * TRACKED VOICE CHANNEL
 * ============================================================
 *
 * We only count users who are actually in a voice channel.
 *
 * The caller can optionally provide a function here later
 * if you want to exclude VoiceMaster/system channels.
 * ============================================================
 */

function isTrackableChannel(
    channel
) {

    if (
        !channel
    ) {

        return false;

    }


    return (
        channel.isVoiceBased &&
        channel.isVoiceBased()
    );

}


/*
 * ============================================================
 * START SESSION
 * ============================================================
 */

async function startSession(
    member
) {

    if (
        !member ||
        !member.guild ||
        !member.user ||
        member.user.bot ||
        !isTrackableChannel(
            member.voice.channel
        )
    ) {

        return false;

    }


    const guildId =
        member.guild.id;

    const userId =
        member.user.id;


    /*
     * Make sure the weekly cycle is still valid.
     */

    try {

        await getCycle(
            guildId
        );

    } catch (error) {

        console.error(
            "[LEADERBOARD VOICE] Failed to check cycle:",
            error
        );

        return false;

    }


    try {

        /*
         * Don't restart an existing session.
         *
         * This is important when Discord sends multiple
         * voice state updates for the same user.
         */

        const existing =
            await VoiceLeaderboard.findOne({
                guildId,
                userId
            });


        if (
            existing &&
            existing.sessionStartedAt
        ) {

            return true;

        }


        await VoiceLeaderboard.findOneAndUpdate(

            {
                guildId,
                userId
            },

            {
                $set: {
                    sessionStartedAt:
                        new Date()
                }
            },

            {
                upsert: true,
                setDefaultsOnInsert: true
            }

        );


        return true;

    } catch (error) {

        console.error(
            "[LEADERBOARD VOICE] Failed to start session:",
            error
        );

        return false;

    }

}


/*
 * ============================================================
 * END SESSION
 * ============================================================
 */

async function endSession(
    member
) {

    if (
        !member ||
        !member.guild ||
        !member.user ||
        member.user.bot
    ) {

        return false;

    }


    const guildId =
        member.guild.id;

    const userId =
        member.user.id;


    try {

        /*
         * Check the weekly cycle first.
         *
         * If the week expired while the bot was offline,
         * old data is cleaned automatically.
         */

        await getCycle(
            guildId
        );


        const record =
            await VoiceLeaderboard.findOne({
                guildId,
                userId
            });


        if (
            !record
        ) {

            return false;

        }


        /*
         * No active session.
         */

        if (
            !record.sessionStartedAt
        ) {

            return true;

        }


        const startedAt =
            new Date(
                record.sessionStartedAt
            ).getTime();


        const now =
            Date.now();


        /*
         * Prevent negative or invalid sessions.
         */

        if (
            !Number.isFinite(
                startedAt
            ) ||
            startedAt > now
        ) {

            record.sessionStartedAt =
                null;

            await record.save();

            return false;

        }


        const seconds =
            Math.floor(
                (
                    now -
                    startedAt
                ) / 1000
            );


        /*
         * Add completed session time.
         */

        if (
            seconds > 0
        ) {

            record.totalSeconds +=
                seconds;

        }


        record.sessionStartedAt =
            null;


        await record.save();


        return true;

    } catch (error) {

        console.error(
            "[LEADERBOARD VOICE] Failed to end session:",
            error
        );

        return false;

    }

}


/*
 * ============================================================
 * HANDLE VOICE STATE UPDATE
 * ============================================================
 *
 * Called from Discord's voiceStateUpdate event.
 *
 * Cases:
 *
 * JOIN
 *      null -> voice
 *
 * LEAVE
 *      voice -> null
 *
 * SWITCH CHANNEL
 *      voice -> voice
 *
 * MUTE / DEAFEN
 *      voice -> same voice
 *
 * Only actual channel changes matter.
 * ============================================================
 */

async function handle(
    oldState,
    newState
) {

    if (
        !newState ||
        !newState.member ||
        newState.member.user.bot
    ) {

        return false;

    }


    const oldChannelId =
        oldState &&
        oldState.channelId;


    const newChannelId =
        newState.channelId;


    /*
     * Nothing changed regarding the channel.
     *
     * Ignore mute, deaf, stream, video, etc.
     */

    if (
        oldChannelId ===
        newChannelId
    ) {

        return false;

    }


    const member =
        newState.member;


    /*
     * --------------------------------------------------------
     * LEAVING A CHANNEL
     * --------------------------------------------------------
     */

    if (
        oldChannelId
    ) {

        await endSession(
            member
        );

    }


    /*
     * --------------------------------------------------------
     * JOINING A CHANNEL
     * --------------------------------------------------------
     */

    if (
        newChannelId &&
        isTrackableChannel(
            newState.channel
        )
    ) {

        await startSession(
            member
        );

    }


    return true;

}


/*
 * ============================================================
 * FINALIZE ACTIVE SESSION
 * ============================================================
 *
 * Used before wiping the weekly leaderboard.
 *
 * This makes sure users currently sitting in voice don't
 * lose their time when the weekly cycle expires.
 * ============================================================
 */

async function finalizeActiveSessions(
    guildId
) {

    if (
        !guildId
    ) {

        return false;

    }


    try {

        const records =
            await VoiceLeaderboard.find({

                guildId,

                sessionStartedAt: {
                    $ne: null
                }

            });


        const now =
            Date.now();


        for (
            const record
            of records
        ) {

            if (
                !record.sessionStartedAt
            ) {

                continue;

            }


            const startedAt =
                new Date(
                    record.sessionStartedAt
                ).getTime();


            if (
                !Number.isFinite(
                    startedAt
                ) ||
                startedAt > now
            ) {

                record.sessionStartedAt =
                    null;

                await record.save();

                continue;

            }


            const seconds =
                Math.floor(
                    (
                        now -
                        startedAt
                    ) / 1000
                );


            if (
                seconds > 0
            ) {

                record.totalSeconds +=
                    seconds;

            }


            /*
             * Clear the old session.
             */

            record.sessionStartedAt =
                null;


            await record.save();

        }


        return true;

    } catch (error) {

        console.error(
            `[LEADERBOARD VOICE] Failed to finalize sessions for ${guildId}:`,
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

        await getCycle(
            guildId
        );


        /*
         * Finalize currently active sessions so the displayed
         * leaderboard stays accurate.
         */

        await finalizeActiveSessions(
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


        return await VoiceLeaderboard
            .find({
                guildId
            })
            .sort({
                totalSeconds: -1
            })
            .limit(
                safeLimit
            )
            .lean();

    } catch (error) {

        console.error(
            "[LEADERBOARD VOICE] Failed to get top users:",
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

        await getCycle(
            guildId
        );


        const user =
            await VoiceLeaderboard
                .findOne({
                    guildId,
                    userId
                })
                .lean();


        if (
            !user
        ) {

            return null;

        }


        const usersAbove =
            await VoiceLeaderboard
                .countDocuments({

                    guildId,

                    totalSeconds: {
                        $gt:
                            user.totalSeconds
                    }

                });


        return {

            rank:
                usersAbove + 1,

            totalSeconds:
                user.totalSeconds || 0

        };

    } catch (error) {

        console.error(
            "[LEADERBOARD VOICE] Failed to get user rank:",
            error
        );

        return null;

    }

}


/*
 * ============================================================
 * RESET GUILD
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

        await VoiceLeaderboard.deleteMany({
            guildId
        });


        console.log(
            `[LEADERBOARD VOICE] Reset guild ${guildId}.`
        );


        return true;

    } catch (error) {

        console.error(
            `[LEADERBOARD VOICE] Failed to reset guild ${guildId}:`,
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

    startSession,

    endSession,

    handle,

    finalizeActiveSessions,

    getTop,

    getRank,

    reset

};
