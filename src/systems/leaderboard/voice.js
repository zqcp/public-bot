// src/systems/leaderboard/voice.js

const VoiceLeaderboard =
    require("../../models/VoiceLeaderboard");


function trackable(
    channel
) {

    return !!(
        channel &&
        channel.isVoiceBased?.()
    );

}


async function startSession(
    member
) {

    if (
        !member?.guild ||
        member.user?.bot ||
        !trackable(member.voice.channel)
    ) {
        return false;
    }


    try {

        await VoiceLeaderboard.updateOne(
            {
                guildId:
                    member.guild.id,

                userId:
                    member.id
            },
            {
                $setOnInsert: {
                    sessionStartedAt:
                        new Date()
                }
            },
            {
                upsert: true
            }
        );


        /*
         * If the record already exists, only start
         * a session when one isn't already active.
         */

        const record =
            await VoiceLeaderboard.findOne({
                guildId:
                    member.guild.id,

                userId:
                    member.id
            });


        if (
            record &&
            !record.sessionStartedAt
        ) {

            record.sessionStartedAt =
                new Date();

            await record.save();

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


async function endSession(
    member
) {

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


        record.totalSeconds +=
            Math.floor(
                (
                    now -
                    started
                ) / 1000
            );


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


async function handle(
    oldState,
    newState
) {

    if (
        !newState?.member ||
        newState.member.user?.bot ||
        oldState?.channelId === newState.channelId
    ) {
        return false;
    }


    const member =
        newState.member;


    if (oldState?.channelId) {

        await endSession(
            member
        );

    }


    if (
        newState.channelId &&
        trackable(newState.channel)
    ) {

        await startSession(
            member
        );

    }


    return true;

}


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
            const record of records
        ) {

            const started =
                new Date(
                    record.sessionStartedAt
                ).getTime();


            if (
                !Number.isFinite(started) ||
                started > now
            ) {

                record.sessionStartedAt =
                    null;

            } else {

                record.totalSeconds +=
                    Math.floor(
                        (
                            now -
                            started
                        ) / 1000
                    );

                record.sessionStartedAt =
                    null;

            }


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


        return await VoiceLeaderboard
            .find({
                guildId
            })
            .sort({
                totalSeconds: -1,
                userId: 1
            })
            .limit(
                safeLimit
            )
            .lean();

    } catch (error) {

        console.error(
            "[LEADERBOARD VOICE] Get top error:",
            error
        );

        return [];

    }

}


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


        const above =
            await VoiceLeaderboard.countDocuments({
                guildId,

                totalSeconds: {
                    $gt:
                        user.totalSeconds
                }
            });


        return {
            rank:
                above + 1,

            totalSeconds:
                user.totalSeconds || 0
        };

    } catch (error) {

        console.error(
            "[LEADERBOARD VOICE] Rank error:",
            error
        );

        return null;

    }

}


async function reset(
    guildId
) {

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
