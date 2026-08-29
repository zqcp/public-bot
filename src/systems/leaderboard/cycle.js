// src/systems/leaderboard/cycle.js

const LeaderboardConfig =
    require("../../models/LeaderboardConfig");

const ChatLeaderboard =
    require("../../models/ChatLeaderboard");

const VoiceLeaderboard =
    require("../../models/VoiceLeaderboard");


/*
 * ============================================================
 * WEEKLY LEADERBOARD CYCLE
 * ============================================================
 *
 * One cycle = 7 days.
 *
 * The timestamps are stored in MongoDB, so the bot can:
 *
 * - restart
 * - update
 * - crash
 * - go offline
 *
 * without losing the current cycle.
 *
 * If the bot returns after the wipe time,
 * the old leaderboard data is completely removed
 * and a new cycle begins automatically.
 * ============================================================
 */

const CYCLE_LENGTH =
    7 * 24 * 60 * 60 * 1000;


/*
 * ============================================================
 * CREATE / GET CYCLE
 * ============================================================
 */

async function getCycle(
    guildId
) {

    let config =
        await LeaderboardConfig.findOne({
            guildId
        });


    /*
     * No configuration exists yet.
     *
     * Create the first cycle.
     */

    if (!config) {

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
     * Check whether the current cycle
     * has expired.
     */

    if (
        Date.now() >=
        new Date(
            config.nextWipeAt
        ).getTime()
    ) {

        await wipeGuild(
            guildId
        );


        const now =
            Date.now();


        /*
         * Keep the existing setup:
         *
         * chatChannelId
         * chatMessageId
         * voiceChannelId
         * voiceMessageId
         *
         * Only reset the weekly cycle.
         */

        config.weekStartedAt =
            new Date(now);

        config.nextWipeAt =
            new Date(
                now +
                CYCLE_LENGTH
            );


        await config.save();

    }


    return config;

}


/*
 * ============================================================
 * WIPE GUILD
 * ============================================================
 *
 * Deletes ALL Chat and VC leaderboard statistics
 * for the specified guild.
 *
 * Configuration is NOT deleted.
 * ============================================================
 */

async function wipeGuild(
    guildId
) {

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
            `[LEADERBOARD] Wiped all leaderboard data for guild ${guildId}.`
        );

    } catch (error) {

        console.error(
            `[LEADERBOARD] Failed to wipe guild ${guildId}:`,
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
 * Used when the bot starts.
 *
 * Every configured guild is checked so an offline period
 * cannot break the weekly cycle.
 * ============================================================
 */

async function checkAllCycles() {

    let configs;


    try {

        configs =
            await LeaderboardConfig.find({});

    } catch (error) {

        console.error(
            "[LEADERBOARD] Failed to load cycles:",
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
                `[LEADERBOARD] Failed to check cycle for ${config.guildId}:`,
                error
            );

        }

    }

}


/*
 * ============================================================
 * GET TIME UNTIL WIPE
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
 * EXPORT
 * ============================================================
 */

module.exports = {

    CYCLE_LENGTH,

    getCycle,

    wipeGuild,

    checkAllCycles,

    getTimeUntilWipe

};
