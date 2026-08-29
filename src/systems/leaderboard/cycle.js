// src/systems/leaderboard/cycle.js

const LeaderboardConfig =
    require("../../models/LeaderboardConfig");

const ChatLeaderboard =
    require("../../models/ChatLeaderboard");

const VoiceLeaderboard =
    require("../../models/VoiceLeaderboard");


/*
 * ============================================================
 * CONFIG
 * ============================================================
 */

const CYCLE_LENGTH =
    7 * 24 * 60 * 60 * 1000;


/*
 * ============================================================
 * GET / CREATE GUILD CYCLE
 * ============================================================
 */

async function getCycle(
    guildId
) {

    if (
        !guildId
    ) {

        return null;

    }


    let config =
        await LeaderboardConfig.findOne({
            guildId
        });


    /*
     * --------------------------------------------------------
     * FIRST TIME SETUP
     * --------------------------------------------------------
     */

    if (
        !config
    ) {

        const now =
            Date.now();


        config =
            await LeaderboardConfig.create({

                guildId,

                weekStartedAt:
                    new Date(now),

                nextWipeAt:
                    new Date(
                        now +
                        CYCLE_LENGTH
                    )

            });


        return config;

    }


    /*
     * --------------------------------------------------------
     * CHECK WEEK EXPIRATION
     * --------------------------------------------------------
     *
     * This is what makes the system survive downtime.
     *
     * Example:
     *
     * Wipe time = Saturday 12:00 PM
     * Bot goes offline Friday.
     * Bot comes back Sunday.
     *
     * The next request sees that nextWipeAt has passed
     * and automatically starts a new cycle.
     */

    const now =
        Date.now();

    const wipeTime =
        new Date(
            config.nextWipeAt
        ).getTime();


    if (
        now >= wipeTime
    ) {

        await wipeGuild(
            guildId
        );


        /*
         * Start a completely new cycle from NOW.
         *
         * This means downtime does not cause another
         * immediate wipe.
         */

        const newStart =
            new Date(now);

        const newWipe =
            new Date(
                now +
                CYCLE_LENGTH
            );


        config.weekStartedAt =
            newStart;

        config.nextWipeAt =
            newWipe;


        await config.save();

    }


    return config;

}


/*
 * ============================================================
 * WIPE GUILD DATA
 * ============================================================
 *
 * IMPORTANT:
 *
 * This deletes ONLY leaderboard statistics.
 *
 * It does NOT delete:
 *
 * - leaderboard config
 * - channel IDs
 * - message IDs
 * - leaderboard messages
 *
 * The existing embeds can therefore be edited after
 * the wipe instead of creating new messages.
 * ============================================================
 */

async function wipeGuild(
    guildId
) {

    if (
        !guildId
    ) {

        return;

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
            `[LEADERBOARD] Weekly data wiped for guild ${guildId}.`
        );


    } catch (error) {

        console.error(
            `[LEADERBOARD] Failed to wipe data for ${guildId}:`,
            error
        );


        throw error;

    }

}


/*
 * ============================================================
 * CHECK ALL GUILDS
 * ============================================================
 *
 * Called when the bot starts.
 *
 * This makes sure a bot restart/offline period does not
 * break the weekly leaderboard cycle.
 * ============================================================
 */

async function checkAllCycles() {

    let configs;


    try {

        configs =
            await LeaderboardConfig.find({});

    } catch (error) {

        console.error(
            "[LEADERBOARD] Failed to load configurations:",
            error
        );

        return;

    }


    for (
        const config
        of configs
    ) {

        try {

            await getCycle(
                config.guildId
            );

        } catch (error) {

            console.error(
                `[LEADERBOARD] Failed to check ${config.guildId}:`,
                error
            );

        }

    }

}


/*
 * ============================================================
 * TIME UNTIL WIPE
 * ============================================================
 */

function getTimeUntilWipe(
    nextWipeAt
) {

    if (
        !nextWipeAt
    ) {

        return 0;

    }


    return Math.max(
        0,
        new Date(
            nextWipeAt
        ).getTime() -
        Date.now()
    );

}


/*
 * ============================================================
 * FORMAT WIPE TIME
 * ============================================================
 *
 * Example:
 *
 * 6d 14h
 * 3h 42m
 * 18m
 * ============================================================
 */

function formatTimeUntilWipe(
    nextWipeAt
) {

    let remaining =
        getTimeUntilWipe(
            nextWipeAt
        );


    if (
        remaining <= 0
    ) {

        return "now";

    }


    const day =
        24 * 60 * 60 * 1000;

    const hour =
        60 * 60 * 1000;

    const minute =
        60 * 1000;


    const days =
        Math.floor(
            remaining / day
        );

    remaining %=
        day;


    const hours =
        Math.floor(
            remaining / hour
        );

    remaining %=
        hour;


    const minutes =
        Math.floor(
            remaining / minute
        );


    if (
        days > 0
    ) {

        return `${days}d ${hours}h`;

    }


    if (
        hours > 0
    ) {

        return `${hours}h ${minutes}m`;

    }


    return `${Math.max(
        minutes,
        1
    )}m`;

}


/*
 * ============================================================
 * EXPORT
 * ============================================================
 */

module.exports = {

    CYCLE_LENGTH,

    getCycle,

    wipeGuild,

    checkAllCycles,

    getTimeUntilWipe,

    formatTimeUntilWipe

};
