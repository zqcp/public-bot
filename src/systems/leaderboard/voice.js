// src/systems/leaderboard/voice.js

const VoiceLeaderboard =
    require("../../models/VoiceLeaderboard");


function trackable(channel) {

    return !!(
        channel &&
        channel.isVoiceBased?.()
    );

}


/*
 * Start tracking a user.
 */

async function startSession(member) {

    if (
        !member?.guild ||
        member.user?.bot ||
        !trackable(member.voice.channel)
    ) {
        return false;
    }

    try {

        const now =
            new Date();

        const result =
            await VoiceLeaderboard.updateOne(

                {
                    guildId:
                        member.guild.id,

                    userId:
                        member.id
                },

                {
                    $setOnInsert: {
                        totalSeconds: 0,

                        sessionStartedAt:
                            now
                    }
                },

                {
                    upsert: true
                }

            );


        /*
         * Existing record with no active session.
         */

        if (
            !result.upsertedCount
        ) {

            await VoiceLeaderboard.updateOne(

                {
                    guildId:
                        member.guild.id,

                    userId:
                        member.id,

                    sessionStartedAt:
                        null
                },

                {
                    $set: {
                        sessionStartedAt:
                            now
                    }
                }

            );

        }


        return true;

    } catch (error) {

        console.error(
            "[LEADERBOARD VOICE] Start error:",
            error
        );

        return false;

    }

}


/*
 * End a user's current voice session.
 */

async function endSession(member) {

    if (
        !member?.guild ||
        member.user?.bot
    ) {
        return false;
    }

    try {

        const record =
            await VoiceLeaderboard.findOne({
                guildId:
                    member.guild.id,

                userId:
                    member.id
            });


        if (
            !record ||
            !record.sessionStartedAt
        ) {
            return false;
        }


        const started =
            new Date(
                record.sessionStartedAt
            ).getTime();

        const now =
            Date.now();


        if (
            !Number.isFinite(started) ||
            started > now
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
                    started
                ) / 1000
            );


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
            "[LEADERBOARD VOICE] End error:",
            error
        );

        return false;

    }

}


/*
 * Handle joins, leaves and channel switches.
 */

async function handle(
    oldState,
    newState
) {

    if (
        !newState?.member ||
        newState.member.user?.bot
    ) {
        return false;
    }


    /*
     * Ignore mute, deafen, streaming,
     * camera and other non-channel changes.
     */

    if (
        oldState?.channelId ===
        newState.channelId
    ) {
        return false;
    }


    const member =
        newState.member;


    /*
     * Leaving or switching channel.
     */

    if (
        oldState?.channelId
    ) {

        await endSession(
            member
        );

    }


    /*
     * Joining or switching into
     * another trackable channel.
     */

    if (
        newState.channelId &&
        trackable(
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
 * Get leaderboard.
 *
 * Active sessions are calculated LIVE.
 *
 * We do NOT save the live seconds here and we do NOT
 * clear sessionStartedAt.
 *
 * This allows the leaderboard to update every minute
 * while the user remains in voice.
 */

async function getTop(
    guildId,
    limit = 10
) {

    if (!guildId) {
        return [];
    }


    try {

        const safeLimit =
            Math.min(
                Math.max(
                    Number(limit) || 10,
                    1
                ),
                100
            );


        const records =
            await VoiceLeaderboard
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


        const now =
            Date.now();


        return records
            .map(record => {

                let seconds =
                    Number(
                        record.totalSeconds || 0
                    );


                /*
                 * Add current active session time.
                 */

                if (
                    record.sessionStartedAt
                ) {

                    const started =
                        new Date(
                            record.sessionStartedAt
                        ).getTime();


                    if (
                        Number.isFinite(
                            started
                        ) &&
                        started <= now
                    ) {

                        seconds +=
                            Math.floor(
                                (
                                    now -
                                    started
                                ) / 1000
                            );

                    }

                }


                return {
                    ...record,

                    totalSeconds:
                        seconds

                };

            })
            .sort(
                (a, b) =>
                    b.totalSeconds -
                    a.totalSeconds
            );

    } catch (error) {

        console.error(
            "[LEADERBOARD VOICE] Get top error:",
            error
        );

        return [];

    }

}


/*
 * Get live user rank.
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

        const user =
            await VoiceLeaderboard
                .findOne({
                    guildId,
                    userId
                })
                .lean();


        if (!user) {
            return null;
        }


        let totalSeconds =
            Number(
                user.totalSeconds || 0
            );


        /*
         * Include current active session.
         */

        if (
            user.sessionStartedAt
        ) {

            const started =
                new Date(
                    user.sessionStartedAt
                ).getTime();


            if (
                Number.isFinite(
                    started
                ) &&
                started <= Date.now()
            ) {

                totalSeconds +=
                    Math.floor(
                        (
                            Date.now() -
                            started
                        ) / 1000
                    );

            }

        }


        /*
         * Calculate rank using live time.
         */

        const users =
            await VoiceLeaderboard
                .find({
                    guildId
                })
                .lean();


        let rank = 1;


        for (
            const record of users
        ) {

            let seconds =
                Number(
                    record.totalSeconds || 0
                );


            if (
                record.sessionStartedAt
            ) {

                const started =
                    new Date(
                        record.sessionStartedAt
                    ).getTime();


                if (
                    Number.isFinite(
                        started
                    ) &&
                    started <= Date.now()
                ) {

                    seconds +=
                        Math.floor(
                            (
                                Date.now() -
                                started
                            ) / 1000
                        );

                }

            }


            if (
                seconds >
                totalSeconds
            ) {

                rank++;

            }

        }


        return {

            rank,

            totalSeconds

        };

    } catch (error) {

        console.error(
            "[LEADERBOARD VOICE] Rank error:",
            error
        );

        return null;

    }

}


/*
 * Finalize sessions ONLY when needed for a wipe.
 *
 * This does not run during normal updates.
 */

async function finalizeActiveSessions(
    guildId
) {

    if (!guildId) {
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

            const started =
                new Date(
                    record.sessionStartedAt
                ).getTime();


            if (
                Number.isFinite(started) &&
                started <= now
            ) {

                record.totalSeconds +=
                    Math.floor(
                        (
                            now -
                            started
                        ) / 1000
                    );

            }


            record.sessionStartedAt =
                null;


            await record.save();

        }


        return true;

    } catch (error) {

        console.error(
            "[LEADERBOARD VOICE] Finalize error:",
            error
        );

        return false;

    }

}


/*
 * Delete current week's voice data.
 */

async function reset(guildId) {

    if (!guildId) {
        return false;
    }


    try {

        await VoiceLeaderboard.deleteMany({
            guildId
        });


        return true;

    } catch (error) {

        console.error(
            "[LEADERBOARD VOICE] Reset error:",
            error
        );

        return false;

    }

}


module.exports = {

    startSession,

    endSession,

    handle,

    finalizeActiveSessions,

    getTop,

    getRank,

    reset

};
