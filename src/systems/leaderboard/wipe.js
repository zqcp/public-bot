// src/systems/leaderboard/wipe.js

const LeaderboardConfig =
    require("../../models/LeaderboardConfig");

const ChatLeaderboard =
    require("../../models/ChatLeaderboard");

const VoiceLeaderboard =
    require("../../models/VoiceLeaderboard");

const CYCLE_LENGTH =
    7 * 24 * 60 * 60 * 1000;


/*
 * Wipe leaderboard statistics.
 *
 * Configuration and leaderboard messages stay intact.
 */

async function wipeGuild(
    guildId
) {

    if (!guildId) {
        return false;
    }


    try {

        await Promise.all([

            ChatLeaderboard.deleteMany({
                guildId
            }),

            VoiceLeaderboard.deleteMany({
                guildId
            })

        ]);


        console.log(
            `[LEADERBOARD] Wiped data for ${guildId}.`
        );


        return true;

    } catch (error) {

        console.error(
            `[LEADERBOARD] Wipe failed for ${guildId}:`,
            error
        );

        return false;

    }

}


/*
 * Check one guild.
 *
 * If the bot was offline when the wipe happened,
 * catch up to the current weekly cycle.
 */

async function checkGuild(
    guildId
) {

    if (!guildId) {
        return null;
    }


    let config =
        await LeaderboardConfig.findOne({
            guildId
        });


    /*
     * No configuration yet.
     */

    if (!config) {

        const now =
            new Date();


        return LeaderboardConfig.create({

            guildId,

            weekStartedAt:
                now,

            nextWipeAt:
                new Date(
                    now.getTime() +
                    CYCLE_LENGTH
                )

        });

    }


    let nextWipe =
        new Date(
            config.nextWipeAt
        ).getTime();


    const now =
        Date.now();


    /*
     * Nothing to wipe.
     */

    if (
        now < nextWipe
    ) {

        return config;

    }


    /*
     * Wipe old statistics.
     */

    await wipeGuild(
        guildId
    );


    /*
     * Keep the original weekly schedule.
     *
     * This prevents the wipe day/time from moving
     * simply because the bot was offline.
     */

    while (
        nextWipe <= now
    ) {

        nextWipe +=
            CYCLE_LENGTH;

    }


    config.weekStartedAt =
        new Date(
            nextWipe -
            CYCLE_LENGTH
        );

    config.nextWipeAt =
        new Date(
            nextWipe
        );


    await config.save();


    return config;

}


/*
 * Check every configured guild.
 */

async function checkAll() {

    const configs =
        await LeaderboardConfig
            .find({})
            .select("guildId")
            .lean();


    for (
        const config
        of configs
    ) {

        try {

            await checkGuild(
                config.guildId
            );

        } catch (error) {

            console.error(
                `[LEADERBOARD] Wipe check failed for ${config.guildId}:`,
                error
            );

        }

    }

}


/*
 * Time remaining until wipe.
 */

function getTimeUntilWipe(
    nextWipeAt
) {

    if (!nextWipeAt) {
        return 0;
    }


    return Math.max(
        0,
        new Date(nextWipeAt).getTime() -
        Date.now()
    );

}


function formatTimeUntilWipe(
    nextWipeAt
) {

    let remaining =
        getTimeUntilWipe(
            nextWipeAt
        );


    if (remaining <= 0) {
        return "now";
    }


    const days =
        Math.floor(
            remaining / 86400000
        );

    remaining %=
        86400000;


    const hours =
        Math.floor(
            remaining / 3600000
        );

    remaining %=
        3600000;


    const minutes =
        Math.floor(
            remaining / 60000
        );


    if (days > 0) {
        return `${days}d ${hours}h`;
    }


    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }


    return `${Math.max(
        minutes,
        1
    )}m`;

}


module.exports = {

    CYCLE_LENGTH,

    wipeGuild,

    checkGuild,

    checkAll,

    getTimeUntilWipe,

    formatTimeUntilWipe

};
