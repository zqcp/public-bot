// src/systems/voiceLevel.js

const VoiceLevel =
    require("../models/VoiceLevel");

const sessions =
    new Map();

const pending =
    new Map();

const tierRoles =
    new Map();

const FLUSH_INTERVAL =
    5 * 60 * 1000;

const MINUTE =
    60 * 1000;


/*
 * SESSION KEY
 */

function key(guildId, userId) {

    return `${guildId}:${userId}`;

}


/*
 * FORMAT TIME
 */

function formatTime(milliseconds) {

    const totalMinutes =
        Math.floor(
            milliseconds / MINUTE
        );

    const days =
        Math.floor(
            totalMinutes / 1440
        );

    const hours =
        Math.floor(
            (totalMinutes % 1440) / 60
        );

    const minutes =
        totalMinutes % 60;

    const parts = [];

    if (days) {
        parts.push(`${days}d`);
    }

    if (hours) {
        parts.push(`${hours}h`);
    }

    if (minutes || !parts.length) {
        parts.push(`${minutes}m`);
    }

    return parts.join(" ");

}


/*
 * GET / CREATE STATS
 */

async function getStats(
    guildId,
    userId
) {

    const id =
        key(
            guildId,
            userId
        );

    let stats =
        await VoiceLevel.findOne({
            guildId,
            userId
        }).lean();

    if (!stats) {

        stats = {
            guildId,
            userId,
            allTime: 0,
            today: 0,
            todayDate: getDate()
        };

    }

    const session =
        sessions.get(id);

    if (
        session &&
        session.startedAt
    ) {

        const elapsed =
            Date.now() -
            session.startedAt;

        stats.allTime += elapsed;
        stats.today += elapsed;

    }

    return stats;

}


/*
 * START SESSION
 */

function start(
    guildId,
    userId
) {

    const id =
        key(
            guildId,
            userId
        );

    if (sessions.has(id)) {
        return;
    }

    sessions.set(id, {

        guildId,

        userId,

        startedAt:
            Date.now()

    });

}


/*
 * STOP SESSION
 */

async function stop(
    guildId,
    userId
) {

    const id =
        key(
            guildId,
            userId
        );

    const session =
        sessions.get(id);

    if (!session) {
        return;
    }

    sessions.delete(id);

    const elapsed =
        Date.now() -
        session.startedAt;

    if (elapsed <= 0) {
        return;
    }

    addPending(
        guildId,
        userId,
        elapsed
    );

}


/*
 * ADD PENDING
 */

function addPending(
    guildId,
    userId,
    milliseconds
) {

    const id =
        key(
            guildId,
            userId
        );

    const existing =
        pending.get(id) || {

            guildId,

            userId,

            milliseconds: 0

        };

    existing.milliseconds +=
        milliseconds;

    pending.set(
        id,
        existing
    );

}


/*
 * FLUSH TO MONGO
 */

async function flush() {

    if (!pending.size) {
        return;
    }

    const updates =
        Array.from(
            pending.values()
        );

    pending.clear();

    try {

        await VoiceLevel.bulkWrite(

            updates.map(
                entry => ({

                    updateOne: {

                        filter: {

                            guildId:
                                entry.guildId,

                            userId:
                                entry.userId

                        },

                        update: {

                            $inc: {

                                allTime:
                                    entry.milliseconds,

                                today:
                                    entry.milliseconds

                            },

                            $set: {

                                todayDate:
                                    getDate()

                            }

                        },

                        upsert: true

                    }

                })
            ),

            {
                ordered: false
            }

        );

    } catch (error) {

        console.error(
            "[VOICE LEVEL] Failed to flush:",
            error
        );

        for (
            const entry of updates
        ) {

            addPending(
                entry.guildId,
                entry.userId,
                entry.milliseconds
            );

        }

    }

}


/*
 * GET DATE
 */

function getDate() {

    const now =
        new Date();

    return [
        now.getFullYear(),
        String(
            now.getMonth() + 1
        ).padStart(2, "0"),
        String(
            now.getDate()
        ).padStart(2, "0")
    ].join("-");

}


/*
 * RESET TODAY
 */

async function resetToday() {

    await VoiceLevel.updateMany(

        {
            todayDate: {
                $ne:
                    getDate()
            }
        },

        {
            $set: {

                today:
                    0,

                todayDate:
                    getDate()

            }

        }

    );

}


/*
 * SET TIER ROLE
 */

function setTierRole(
    guildId,
    level,
    roleId
) {

    let roles =
        tierRoles.get(guildId);

    if (!roles) {

        roles =
            new Map();

        tierRoles.set(
            guildId,
            roles
        );

    }

    roles.set(
        Number(level),
        roleId
    );

}


/*
 * GET TIER
 *
 * Highest configured tier
 * the user has reached.
 */

async function getTier(
    guildId,
    milliseconds
) {

    const roles =
        tierRoles.get(guildId);

    if (!roles || !roles.size) {

        return {

            level: 0,

            name:
                "No Tier"

        };

    }

    const hours =
        milliseconds /
        (60 * 60 * 1000);

    let current =
        0;

    let roleId =
        null;

    for (
        const [
            level,
            id
        ] of roles
    ) {

        if (
            hours >= level &&
            level > current
        ) {

            current =
                level;

            roleId =
                id;

        }

    }

    if (!roleId) {

        return {

            level: 0,

            name:
                "No Tier"

        };

    }

    return {

        level:
            current,

        name:
            `<@&${roleId}>`

    };

}


/*
 * RESTORE ACTIVE SESSION
 *
 * Used after bot restart if
 * the member is already in VC.
 */

function restore(
    guildId,
    userId,
    startedAt
) {

    const id =
        key(
            guildId,
            userId
        );

    sessions.set(
        id,
        {

            guildId,

            userId,

            startedAt:
                startedAt ||
                Date.now()

        }
    );

}


/*
 * FLUSH EVERY 5 MINUTES
 */

setInterval(
    flush,
    FLUSH_INTERVAL
);


/*
 * RESET DAILY STATS
 */

setInterval(
    resetToday,
    60 * 1000
);


/*
 * EXPORT
 */

module.exports = {

    start,

    stop,

    restore,

    flush,

    getStats,

    getTier,

    setTierRole,

    formatTime

};
