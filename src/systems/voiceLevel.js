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

const LEVEL_MINUTES =
    60;

function key(guildId, userId) {

    return `${guildId}:${userId}`;

}


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


function getLevel(milliseconds) {

    return Math.floor(
        milliseconds /
        (LEVEL_MINUTES * MINUTE)
    );

}


function formatTime(milliseconds) {

    const totalMinutes =
        Math.floor(
            milliseconds /
            MINUTE
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

        parts.push(
            `${days}d`
        );

    }

    if (hours) {

        parts.push(
            `${hours}h`
        );

    }

    if (
        minutes ||
        !parts.length
    ) {

        parts.push(
            `${minutes}m`
        );

    }

    return parts.join(" ");

}


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

    const today =
        getDate();

    if (!stats) {

        stats = {

            guildId,
            userId,

            allTime: 0,
            today: 0,

            todayDate:
                today

        };

    } else if (
        stats.todayDate !== today
    ) {

        stats.today = 0;

        stats.todayDate =
            today;

    }

    /*
     * INCLUDE TIME THAT HAS NOT
     * BEEN WRITTEN TO MONGODB YET.
     */

    const pendingEntry =
        pending.get(id);

    if (pendingEntry) {

        stats.allTime +=
            pendingEntry.milliseconds;

        /*
         * Pending time belongs
         * to today because it was
         * generated during the
         * current active date.
         */

        stats.today +=
            pendingEntry.milliseconds;

    }

    /*
     * INCLUDE CURRENT ACTIVE
     * VOICE SESSION.
     */

    const session =
        sessions.get(id);

    if (
        session &&
        session.startedAt
    ) {

        const elapsed =
            Math.max(
                0,
                Date.now() -
                session.startedAt
            );

        stats.allTime +=
            elapsed;

        stats.today +=
            elapsed;

    }

    stats.level =
        getLevel(
            stats.allTime
        );

    return stats;

}


function start(
    guildId,
    userId
) {

    const id =
        key(
            guildId,
            userId
        );

    if (
        sessions.has(id)
    ) {

        return;

    }

    sessions.set(
        id,
        {

            guildId,
            userId,

            startedAt:
                Date.now()

        }
    );

}


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
        Math.max(
            0,
            Date.now() -
            session.startedAt
        );

    if (!elapsed) {

        return;

    }

    addPending(
        guildId,
        userId,
        elapsed
    );

}


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


async function flush() {

    if (!pending.size) {

        return;

    }

    const updates =
        Array.from(
            pending.values()
        );

    pending.clear();

    const today =
        getDate();

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

                        update: [

                            {
                                $set: {

                                    guildId:
                                        entry.guildId,

                                    userId:
                                        entry.userId,

                                    todayDate:
                                        today

                                }

                            },

                            {
                                $set: {

                                    allTime: {

                                        $add: [

                                            {
                                                $ifNull: [
                                                    "$allTime",
                                                    0
                                                ]
                                            },

                                            entry.milliseconds

                                        ]

                                    },

                                    today: {

                                        $add: [

                                            {
                                                $cond: [

                                                    {
                                                        $eq: [
                                                            "$todayDate",
                                                            today
                                                        ]
                                                    },

                                                    {
                                                        $ifNull: [
                                                            "$today",
                                                            0
                                                        ]
                                                    },

                                                    0

                                                ]

                                            },

                                            entry.milliseconds

                                        ]

                                    }

                                }

                            }

                        ],

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

        /*
         * PUT FAILED ENTRIES
         * BACK INTO MEMORY.
         */

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


function setTierRole(
    guildId,
    level,
    roleId
) {

    const numericLevel =
        Number(level);

    if (
        !Number.isFinite(
            numericLevel
        ) ||
        numericLevel < 1
    ) {

        return false;

    }

    let roles =
        tierRoles.get(
            guildId
        );

    if (!roles) {

        roles =
            new Map();

        tierRoles.set(
            guildId,
            roles
        );

    }

    roles.set(
        numericLevel,
        roleId
    );

    return true;

}


async function getTier(
    guild,
    userLevel
) {

    if (
        !guild
    ) {

        return {

            level: 0,
            name: "No Tier"

        };

    }

    const roles =
        tierRoles.get(
            guild.id
        );

    if (
        !roles ||
        !roles.size
    ) {

        return {

            level: 0,
            name: "No Tier"

        };

    }

    const level =
        Number(userLevel) || 0;

    let highestLevel =
        0;

    let roleId =
        null;

    /*
     * FIND THE HIGHEST
     * CONFIGURED LEVEL THAT
     * THE USER HAS REACHED.
     *
     * Example:
     *
     * Level 5  -> Role A
     * Level 10 -> Role B
     * Level 25 -> Role C
     *
     * User Level 30
     * -> Role C
     */

    for (
        const [
            tierLevel,
            configuredRoleId
        ] of roles
    ) {

        if (
            tierLevel <= level &&
            tierLevel > highestLevel &&
            configuredRoleId
        ) {

            highestLevel =
                tierLevel;

            roleId =
                configuredRoleId;

        }

    }

    /*
     * NO ROLE APPLIES TO
     * THE USER'S LEVEL.
     */

    if (!roleId) {

        return {

            level: 0,
            name: "No Tier"

        };

    }

    /*
     * DISPLAY THE ROLE NAME
     * AS TEXT.
     *
     * NEVER DISPLAY:
     * <@&ROLE_ID>
     */

    const role =
        guild.roles.cache.get(
            roleId
        );

    if (!role) {

        return {

            level: 0,
            name: "No Tier"

        };

    }

    return {

        level:
            highestLevel,

        name:
            role.name

    };

}


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


setInterval(
    flush,
    FLUSH_INTERVAL
);


module.exports = {

    start,
    stop,
    restore,

    flush,

    getStats,
    getTier,

    setTierRole,

    getLevel,
    formatTime

};
