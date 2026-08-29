// src/systems/textFilter.js

const {
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const Filter =
    require("../models/TextFilter");

const config =
    require("../config");


// ============================================================
// STRIKE SYSTEM
// ============================================================
//
// 1st violation = 10 minutes
// 2nd violation = 1 hour
// 3rd violation = 1 day
//
// After the 1-day punishment expires, strikes reset.
//
// Strike data is intentionally stored in memory.
// Restarting the bot resets the escalation.
// ============================================================

const strikes = new Map();

const TIMEOUTS = [
    10 * 60 * 1000,
    60 * 60 * 1000,
    24 * 60 * 60 * 1000
];


// ============================================================
// HOMOGLYPHS
// ============================================================

const HOMOGLYPHS = {

    "а": "a",
    "А": "a",
    "ɑ": "a",
    "α": "a",

    "Ь": "b",
    "ь": "b",
    "Ᏸ": "b",

    "ϲ": "c",
    "с": "c",
    "С": "c",

    "ԁ": "d",
    "ԃ": "d",

    "е": "e",
    "Е": "e",
    "ҽ": "e",
    "є": "e",

    "ғ": "f",
    "Ғ": "f",

    "ɡ": "g",
    "ց": "g",

    "һ": "h",
    "н": "h",

    "і": "i",
    "І": "i",
    "ι": "i",
    "ɩ": "i",

    "ј": "j",

    "κ": "k",
    "к": "k",
    "К": "k",

    "ⅼ": "l",
    "ӏ": "l",

    "м": "m",
    "М": "m",

    "ո": "n",
    "п": "n",

    "о": "o",
    "О": "o",
    "ο": "o",
    "օ": "o",

    "р": "p",
    "Р": "p",

    "զ": "q",

    "г": "r",
    "Γ": "r",

    "ѕ": "s",
    "Ѕ": "s",
    "ş": "s",

    "т": "t",
    "Т": "t",
    "τ": "t",

    "υ": "u",
    "ս": "u",

    "ν": "v",

    "ԝ": "w",
    "ω": "w",

    "х": "x",
    "Х": "x",
    "χ": "x",

    "у": "y",
    "У": "y",

    "ᴢ": "z"
};


// ============================================================
// LEETSPEAK
// ============================================================

function applyLeetspeak(text) {

    return text
        .replace(/[@4]/g, "a")
        .replace(/[8]/g, "b")
        .replace(/[3]/g, "e")
        .replace(/[6]/g, "g")
        .replace(/[1!|]/g, "i")
        .replace(/[0]/g, "o")
        .replace(/[5$]/g, "s")
        .replace(/[7]/g, "t")
        .replace(/[2]/g, "z")
        .replace(/[9]/g, "g");

}


// ============================================================
// HOMOGLYPH NORMALIZATION
// ============================================================

function normalizeHomoglyphs(text) {

    return text
        .split("")
        .map(
            character =>
                HOMOGLYPHS[character] ||
                character
        )
        .join("");

}


// ============================================================
// REMOVE INVISIBLE CHARACTERS
// ============================================================

function removeInvisible(text) {

    return text
        .replace(
            /[\u0000-\u001F\u007F-\u009F]/g,
            ""
        )
        .replace(
            /[\u00AD\u034F\u061C\u115F\u1160\u17B4\u17B5]/g,
            ""
        )
        .replace(
            /[\u180B-\u180D\u200B-\u200F\u202A-\u202E]/g,
            ""
        )
        .replace(
            /[\u2060-\u2064\u2066-\u206F]/g,
            ""
        )
        .replace(
            /[\uFE00-\uFE0F]/g,
            ""
        )
        .replace(
            /[\uFEFF]/g,
            ""
        );

}


// ============================================================
// BASE NORMALIZATION
// ============================================================

function normalizeBase(text) {

    if (!text) {
        return "";
    }

    return normalizeHomoglyphs(
        removeInvisible(
            text
                .normalize("NFKD")
                .toLowerCase()
        )
    );

}


// ============================================================
// AGGRESSIVE NORMALIZATION
// ============================================================

function normalizeAggressive(text) {

    let result =
        normalizeBase(text);

    result =
        applyLeetspeak(result);

    result =
        result
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .replace(
                /[^\p{L}\p{N}]/gu,
                ""
            );

    return result;

}


// ============================================================
// LOOSE NORMALIZATION
// ============================================================

function normalizeLoose(text) {

    let result =
        normalizeBase(text);

    result =
        applyLeetspeak(result);

    result =
        result
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .replace(
                /[^\p{L}\p{N}\s]/gu,
                " "
            )
            .replace(
                /\s+/g,
                " "
            )
            .trim();

    return result;

}


// ============================================================
// COLLAPSE REPEATED CHARACTERS
// ============================================================

function collapseRepeated(text) {

    return text.replace(
        /(.)\1+/gu,
        "$1"
    );

}


// ============================================================
// REMOVE SPACES
// ============================================================

function removeSpaces(text) {

    return text.replace(
        /\s+/g,
        ""
    );

}


// ============================================================
// BUILD MESSAGE VERSIONS
// ============================================================

function buildVersions(text) {

    const base =
        normalizeBase(text);

    const aggressive =
        normalizeAggressive(text);

    const loose =
        normalizeLoose(text);

    const spaceFree =
        removeSpaces(loose);

    const collapsed =
        collapseRepeated(aggressive);

    const collapsedSpaceFree =
        collapseRepeated(spaceFree);

    return {

        original:
            text.toLowerCase(),

        base,

        aggressive,

        loose,

        spaceFree,

        collapsed,

        collapsedSpaceFree

    };

}


// ============================================================
// BUILD WORD VERSIONS
// ============================================================

function buildWordVersions(word) {

    const versions =
        buildVersions(word);

    return {

        original:
            word
                .trim()
                .toLowerCase(),

        aggressive:
            versions.aggressive,

        spaceFree:
            versions.spaceFree,

        collapsed:
            versions.collapsed,

        collapsedSpaceFree:
            versions.collapsedSpaceFree

    };

}


// ============================================================
// MATCH FILTER WORD
// ============================================================

function matchesWord(
    content,
    word
) {

    if (
        !word ||
        !word.trim()
    ) {
        return false;
    }

    const message =
        buildVersions(content);

    const blocked =
        buildWordVersions(word);


    // --------------------------------------------------------
    // Exact match
    // --------------------------------------------------------

    if (
        blocked.original &&
        message.original.includes(
            blocked.original
        )
    ) {
        return true;
    }


    // --------------------------------------------------------
    // Normalized match
    // --------------------------------------------------------

    if (
        blocked.aggressive &&
        blocked.aggressive.length >= 2 &&
        message.aggressive.includes(
            blocked.aggressive
        )
    ) {
        return true;
    }


    // --------------------------------------------------------
    // Spacing / punctuation bypass
    // --------------------------------------------------------

    if (
        blocked.spaceFree &&
        blocked.spaceFree.length >= 2 &&
        message.spaceFree.includes(
            blocked.spaceFree
        )
    ) {
        return true;
    }


    // --------------------------------------------------------
    // Repeated-character bypass
    // --------------------------------------------------------

    if (
        blocked.collapsed &&
        blocked.collapsed.length >= 2 &&
        message.collapsed.includes(
            blocked.collapsed
        )
    ) {
        return true;
    }


    // --------------------------------------------------------
    // Repeated characters + spaces
    // --------------------------------------------------------

    if (
        blocked.collapsedSpaceFree &&
        blocked.collapsedSpaceFree.length >= 2 &&
        message.collapsedSpaceFree.includes(
            blocked.collapsedSpaceFree
        )
    ) {
        return true;
    }


    // --------------------------------------------------------
    // Character-separated bypass
    //
    // Example:
    //
    // b a d
    // b.a.d
    // b-a-d
    // b__a__d
    // --------------------------------------------------------

    if (
        blocked.aggressive &&
        blocked.aggressive.length >= 2
    ) {

        const separatedPattern =
            blocked.aggressive
                .split("")
                .map(
                    character =>
                        `${escapeRegex(character)}[\\W_\\s]*`
                )
                .join("");

        try {

            const regex =
                new RegExp(
                    separatedPattern,
                    "iu"
                );

            if (
                regex.test(
                    message.base
                )
            ) {
                return true;
            }

        } catch {
            // Ignore invalid regex.
        }

    }


    return false;

}


// ============================================================
// ESCAPE REGEX
// ============================================================

function escapeRegex(text) {

    return text.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );

}


// ============================================================
// STRIKE KEY
// ============================================================

function getStrikeKey(
    guildId,
    userId
) {

    return `${guildId}:${userId}`;

}


// ============================================================
// GET STRIKE
// ============================================================

function getStrike(
    guildId,
    userId
) {

    const key =
        getStrikeKey(
            guildId,
            userId
        );

    const record =
        strikes.get(key);


    if (!record) {

        return {
            key,
            strikes: 0,
            lastViolation: 0,
            timeoutUntil: 0
        };

    }


    // --------------------------------------------------------
    // Reset after the 1-day punishment expires.
    // --------------------------------------------------------

    if (
        record.strikes >= 3 &&
        Date.now() >= record.timeoutUntil
    ) {

        strikes.delete(key);

        return {
            key,
            strikes: 0,
            lastViolation: 0,
            timeoutUntil: 0
        };

    }


    return {

        key,

        strikes:
            record.strikes || 0,

        lastViolation:
            record.lastViolation || 0,

        timeoutUntil:
            record.timeoutUntil || 0

    };

}


// ============================================================
// SET STRIKE
// ============================================================

function setStrike(
    guildId,
    userId,
    strikeNumber,
    timeoutDuration
) {

    const key =
        getStrikeKey(
            guildId,
            userId
        );

    const now =
        Date.now();

    strikes.set(
        key,
        {
            strikes:
                strikeNumber,

            lastViolation:
                now,

            timeoutUntil:
                now + timeoutDuration
        }
    );

}


// ============================================================
// FORMAT DURATION
// ============================================================

function formatDuration(
    milliseconds
) {

    if (
        milliseconds >=
        24 * 60 * 60 * 1000
    ) {
        return "1 day";
    }

    if (
        milliseconds >=
        60 * 60 * 1000
    ) {

        const hours =
            Math.round(
                milliseconds /
                (60 * 60 * 1000)
            );

        return `${hours} hour${hours === 1 ? "" : "s"}`;

    }

    const minutes =
        Math.round(
            milliseconds / 60000
        );

    return `${minutes} minute${minutes === 1 ? "" : "s"}`;

}


// ============================================================
// MAIN FILTER
// ============================================================

module.exports = {

    async handle(
        client,
        message
    ) {

        // ----------------------------------------------------
        // Ignore invalid messages.
        // ----------------------------------------------------

        if (
            !message ||
            !message.author ||
            message.author.bot
        ) {
            return false;
        }


        // ----------------------------------------------------
        // Guild only.
        // ----------------------------------------------------

        if (
            !message.guild
        ) {
            return false;
        }


        // ----------------------------------------------------
        // Ignore empty messages.
        // ----------------------------------------------------

        if (
            !message.content ||
            !message.content.trim()
        ) {
            return false;
        }


        // ----------------------------------------------------
        // Get THIS guild's filter.
        // ----------------------------------------------------

        let filter;

        try {

            filter =
                await Filter.findOne({
                    guildId:
                        message.guild.id
                });

        } catch (error) {

            console.error(
                "[TEXT FILTER] Database error:",
                error
            );

            return false;

        }


        // ----------------------------------------------------
        // Filter isn't configured/enabled.
        // ----------------------------------------------------

        if (
            !filter ||
            filter.enabled !== true ||
            !Array.isArray(filter.words) ||
            filter.words.length === 0
        ) {
            return false;
        }


        // ----------------------------------------------------
        // Find blocked word.
        // ----------------------------------------------------

        const matchedWord =
            filter.words.find(
                word =>
                    matchesWord(
                        message.content,
                        word
                    )
            );


        if (
            !matchedWord
        ) {
            return false;
        }


        // ----------------------------------------------------
        // Get member.
        // ----------------------------------------------------

        let member =
            message.member;

        if (!member) {

            member =
                await message.guild.members
                    .fetch(
                        message.author.id
                    )
                    .catch(
                        () => null
                    );

        }


        // ----------------------------------------------------
        // Administrator check.
        // ----------------------------------------------------

        const isAdministrator =
            member &&
            member.permissions.has(
                PermissionFlagsBits.Administrator
            );


        // ----------------------------------------------------
        // DELETE MESSAGE FIRST.
        // ----------------------------------------------------

        try {

            await message.delete();

        } catch (error) {

            console.error(
                "[TEXT FILTER] Failed to delete message:",
                error
            );

            /*
             * Don't stop the filter completely if
             * deletion fails. Continue so the
             * moderation action can still be attempted.
             */

        }


        // ----------------------------------------------------
        // Administrators:
        //
        // Message is removed but no timeout.
        // ----------------------------------------------------

        if (
            isAdministrator
        ) {

            try {

                const embed =
                    new EmbedBuilder()
                        .setColor(
                            config.colors.error
                        )
                        .setDescription(
                            `${config.emojis.error} ${message.author}: Your message was removed because it contained a blocked word.`
                        );

                await message.channel.send({
                    embeds: [
                        embed
                    ]
                });

            } catch (error) {

                console.error(
                    "[TEXT FILTER] Failed to send warning:",
                    error
                );

            }

            return true;

        }


        // ----------------------------------------------------
        // Get current strike.
        // ----------------------------------------------------

        const current =
            getStrike(
                message.guild.id,
                message.author.id
            );


        // ----------------------------------------------------
        // Already punished?
        //
        // Don't increase the strike or re-timeout them.
        // Their messages are still deleted.
        // ----------------------------------------------------

        if (
            current.timeoutUntil &&
            Date.now() <
                current.timeoutUntil
        ) {

            return true;

        }


        // ----------------------------------------------------
        // Determine next strike.
        // ----------------------------------------------------

        const strikeNumber =
            Math.min(
                current.strikes + 1,
                3
            );

        const timeoutDuration =
            TIMEOUTS[
                strikeNumber - 1
            ];


        // ----------------------------------------------------
        // Make sure member can actually be moderated.
        // ----------------------------------------------------

        if (
            !member ||
            !member.moderatable
        ) {

            console.warn(
                `[TEXT FILTER] Cannot timeout ${message.author.tag} in ${message.guild.name}.`
            );

            return true;

        }


        // ----------------------------------------------------
        // Apply timeout.
        //
        // IMPORTANT:
        // Only save the strike AFTER Discord successfully
        // applies the timeout.
        // ----------------------------------------------------

        try {

            await member.timeout(
                timeoutDuration,
                `Text filter - violation #${strikeNumber}`
            );

        } catch (error) {

            console.error(
                "[TEXT FILTER] Failed to timeout user:",
                error
            );

            /*
             * Don't save the strike if Discord rejected
             * the timeout. This prevents the escalation
             * system from becoming inaccurate.
             */

            return true;

        }


        // ----------------------------------------------------
        // Save strike.
        // ----------------------------------------------------

        setStrike(
            message.guild.id,
            message.author.id,
            strikeNumber,
            timeoutDuration
        );


        // ----------------------------------------------------
        // Warning embed.
        // ----------------------------------------------------

        try {

            const duration =
                formatDuration(
                    timeoutDuration
                );

            const embed =
                new EmbedBuilder()
                    .setColor(
                        config.colors.error
                    )
                    .setDescription(
                        `${config.emojis.error} ${message.author}: Your message was removed because it contained a blocked word. You have been timed out for **${duration}**. This is filter violation **#${strikeNumber}**.`
                    );

            await message.channel.send({
                embeds: [
                    embed
                ]
            });

        } catch (error) {

            console.error(
                "[TEXT FILTER] Failed to send warning:",
                error
            );

        }


        return true;

    }

};
