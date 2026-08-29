// src/systems/leaderboard/wipe.js

const LeaderboardConfig =
    require("../../models/LeaderboardConfig");

const ChatLeaderboard =
    require("../../models/ChatLeaderboard");

const VoiceLeaderboard =
    require("../../models/VoiceLeaderboard");


const WEEK =
    7 * 24 * 60 * 60 * 1000;


async function check(guildId) {

    if (!guildId) return false;

    const config =
        await LeaderboardConfig.findOne({
            guildId
        });

    if (!config) return false;

    if (
        Date.now() <
        new Date(config.nextWipeAt).getTime()
    ) {
        return false;
    }


    await wipe(guildId);


    const now =
        new Date();


    config.weekStartedAt =
        now;

    config.nextWipeAt =
        new Date(
            now.getTime() + WEEK
        );

    await config.save();

    console.log(
        `[LEADERBOARD] Wiped ${guildId}`
    );

    return true;

}


async function wipe(guildId) {

    if (!guildId) return false;

    try {

        await Promise.all([

            ChatLeaderboard.deleteMany({
                guildId
            }),

            VoiceLeaderboard.deleteMany({
                guildId
            })

        ]);

        return true;

    } catch (error) {

        console.error(
            "[LEADERBOARD WIPE]",
            error
        );

        return false;

    }

}


async function checkAll() {

    const configs =
        await LeaderboardConfig
            .find({})
            .lean()
            .catch(() => []);

    for (const config of configs) {

        await check(
            config.guildId
        ).catch(error =>
            console.error(
                "[LEADERBOARD WIPE]",
                error
            )
        );

    }

}


module.exports = {
    check,
    wipe,
    checkAll
};
