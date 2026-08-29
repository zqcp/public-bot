const VoiceLeaderboard =
    require("../../models/VoiceLeaderboard");


function trackable(channel) {

    return !!channel?.isVoiceBased?.();

}


async function start(member) {

    if (
        !member?.guild ||
        member.user.bot ||
        !trackable(member.voice.channel)
    ) return false;

    try {

        const record =
            await VoiceLeaderboard.findOne({
                guildId: member.guild.id,
                userId: member.id
            });

        if (
            record?.sessionStartedAt
        ) return true;

        await VoiceLeaderboard.findOneAndUpdate(
            {
                guildId: member.guild.id,
                userId: member.id
            },
            {
                $set: {
                    sessionStartedAt: new Date()
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
            "[VOICE LB]",
            error
        );

        return false;

    }

}


async function end(member) {

    if (
        !member?.guild ||
        member.user.bot
    ) return false;

    try {

        const record =
            await VoiceLeaderboard.findOne({
                guildId: member.guild.id,
                userId: member.id
            });

        if (
            !record?.sessionStartedAt
        ) return false;

        const started =
            new Date(
                record.sessionStartedAt
            ).getTime();

        const seconds =
            Math.max(
                0,
                Math.floor(
                    (Date.now() - started) / 1000
                )
            );

        record.totalSeconds += seconds;
        record.sessionStartedAt = null;

        await record.save();

        return true;

    } catch (error) {

        console.error(
            "[VOICE LB]",
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
        newState.member.user.bot
    ) return;

    if (
        oldState.channelId ===
        newState.channelId
    ) return;

    if (oldState.channelId) {
        await end(newState.member);
    }

    if (
        newState.channelId &&
        trackable(newState.channel)
    ) {
        await start(newState.member);
    }

}


async function getTop(
    guildId,
    limit = 10
) {

    if (!guildId) return [];

    try {

        const records =
            await VoiceLeaderboard
                .find({ guildId })
                .lean();

        const now = Date.now();

        return records
            .map(record => {

                let seconds =
                    Number(
                        record.totalSeconds || 0
                    );

                if (record.sessionStartedAt) {

                    const started =
                        new Date(
                            record.sessionStartedAt
                        ).getTime();

                    if (started <= now) {

                        seconds +=
                            Math.floor(
                                (now - started) / 1000
                            );

                    }

                }

                return {
                    ...record,
                    totalSeconds: seconds
                };

            })
            .sort(
                (a, b) =>
                    b.totalSeconds -
                    a.totalSeconds
            )
            .slice(0, limit);

    } catch (error) {

        console.error(
            "[VOICE LB]",
            error
        );

        return [];

    }

}


async function reset(guildId) {

    if (!guildId) return false;

    try {

        await VoiceLeaderboard.deleteMany({
            guildId
        });

        return true;

    } catch (error) {

        console.error(
            "[VOICE LB]",
            error
        );

        return false;

    }

}


module.exports = {
    start,
    end,
    handle,
    getTop,
    reset
};
