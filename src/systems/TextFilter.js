// src/systems/textFilter.js

const {
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const Filter =
    require("../models/TextFilter");

const config =
    require("../config");


/*
 * ============================================================
 * FILTER STRIKE SYSTEM
 * ============================================================
 *
 * 1st violation = 10 minutes
 * 2nd violation = 1 hour
 * 3rd violation = 1 day
 *
 * After the 1-day punishment expires, the user resets.
 *
 * Strike data is intentionally stored in memory.
 * Restarting the bot resets the escalation.
 */

const strikes = new Map();


const TIMEOUTS = [
    10 * 60 * 1000,
    60 * 60 * 1000,
    24 * 60 * 60 * 1000
];


/*
 * ============================================================
 * UNICODE HOMOGLYPH MAP
 * ============================================================
 *
 * Converts characters that visually resemble Latin letters.
 *
 * Example:
 *
 * bаd
 * bаd with Cyrillic "а"
 *
 * becomes:
 *
 * bad
 */

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
    "І": "i",

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

    "ᴢ": "z",
    "ѕ": "s"
};


/*
 * ============================================================
 * LEETSPEAK
 * ============================================================
 */

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


/*
 * ============================================================
 * HOMOGLYPH NORMALIZATION
 * ============================================================
 */

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


/*
 * ============================================================
 * REMOVE INVISIBLE CHARACTERS
 * ============================================================
 *
 * Catches:
 *
 * zero-width spaces
 * zero-width joiners
 * word joiners
 * variation selectors
 * BOM
 * control characters
 */

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


/*
 * ============================================================
 * BASE NORMALIZATION
 * ============================================================
 */

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


/*
 * ============================================================
 * AGGRESSIVE NORMALIZATION
 * ============================================================
 *
 * Removes punctuation and whitespace completely.
 *
 * Example:
 *
 * b.a.d
 * b-a-d
 * b a d
 * b__a__d
 *
 * all become:
 *
 * bad
 */

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

    /*
     * Collapse excessive repeated characters.
     *
     * Example:
     *
     * baaaaaad
     *
     * becomes:
     *
     * baad
     */
    result =
        result.replace(
            /(.)\1{2,}/gu,
            "$1$1"
        );

    return result;

}


/*
 * ============================================================
 * LOOSE NORMALIZATION
 * ============================================================
 *
 * Keeps spaces but removes punctuation.
 */

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


/*
 * ============================================================
 * REMOVE SPACES
 * ============================================================
 */

function removeSpaces(text) {

    return text
        .replace(
            /\s+/g,
            ""
        );

}


/*
 * ============================================================
 * COLLAPSE REPEATED CHARACTERS
 * ============================================================
 */

function collapseRepeated(text) {

    return text.replace(
        /(.)\1+/gu,
        "$1"
    );

}


/*
 * ============================================================
 * BUILD MULTIPLE MESSAGE VERSIONS
 * ============================================================
 *
 * We create several versions because attackers can combine
 * different bypass techniques.
 */

function buildVersions(text) {

    const base =
        normalizeBase(text);

    const leet =
        applyLeetspeak(base);

    const loose =
        normalizeLoose(text);

    const aggressive =
        normalizeAggressive(text);

    const spaceFree =
        removeSpaces(loose);

    const collapsed =
        collapseRepeated(
            aggressive
        );

    const collapsedSpaceFree =
        collapseRepeated(
            spaceFree
        );

    return {

        original:
            text.toLowerCase(),

        base:
            base,

        leet:
            leet,

        loose:
            loose,

        aggressive:
            aggressive,

        spaceFree:
            spaceFree,

        collapsed:
            collapsed,

        collapsedSpaceFree:
            collapsedSpaceFree

    };

}


/*
 * ============================================================
 * BUILD WORD VERSIONS
 * ============================================================
 */

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


/*
 * ============================================================
 * MATCH WORD
 * ============================================================
 */

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


    /*
     * --------------------------------------------------------
     * Normal direct match
     * --------------------------------------------------------
     */

    if (
        message.original.includes(
            blocked.original
        )
    ) {
        return true;
    }


    /*
     * --------------------------------------------------------
     * Unicode / homoglyph match
     * --------------------------------------------------------
     */

    if (
        blocked.aggressive &&
        message.aggressive.includes(
            blocked.aggressive
        )
    ) {
        return true;
    }


    /*
     * --------------------------------------------------------
     * Spacing / punctuation bypass
     * --------------------------------------------------------
     */

    if (
        blocked.spaceFree &&
        message.spaceFree.includes(
            blocked.spaceFree
        )
    ) {
        return true;
    }


    /*
     * --------------------------------------------------------
     * Repeated-character bypass
     * --------------------------------------------------------
     */

    if (
        blocked.collapsed &&
        message.collapsed.includes(
            blocked.collapsed
        )
    ) {
        return true;
    }


    /*
     * --------------------------------------------------------
     * Repeated characters + spaces
     * --------------------------------------------------------
     */

    if (
        blocked.collapsedSpaceFree &&
        message.collapsedSpaceFree.includes(
            blocked.collapsedSpaceFree
        )
    ) {
        return true;
    }


    /*
     * --------------------------------------------------------
     * Character-separated bypass
     *
     * Example:
     *
     * b a d
     * b . a . d
     * b - a - d
     * --------------------------------------------------------
     */

    if (
        blocked.aggressive &&
        blocked.aggressive.length >= 2
    ) {

        const separatedPattern =
            blocked.aggressive
                .split("")
                .map(
                    character =>
                        `${character}[\\W_\\s]*`
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


    /*
     * --------------------------------------------------------
     * Mixed punctuation bypass
     * --------------------------------------------------------
     */

    if (
        blocked.aggressive &&
        blocked.aggressive.length >= 2
    ) {

        const chars =
            blocked.aggressive
                .split("");

        let position = 0;

        for (
            const character
            of chars
        ) {

            const index =
                message.aggressive.indexOf(
                    character,
                    position
                );

            if (
                index === -1
            ) {
                position = -1;
                break;
            }

            position =
                index + 1;

        }

        if (
            position !== -1
        ) {
            return true;
        }

    }


    return false;

}


/*
 * ============================================================
 * STRIKE KEY
 * ============================================================
 */

function getStrikeKey(
    guildId,
    userId
) {

    return `${guildId}:${userId}`;

}


/*
 * ============================================================
 * GET STRIKE
 * ============================================================
 */

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


    /*
     * If the 1-day punishment has expired,
     * reset the user completely.
     */

    if (
        record.strikes >= 3 &&
        Date.now() -
            record.lastViolation >=
            TIMEOUTS[2]
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


/*
 * ============================================================
 * ADD STRIKE
 * ============================================================
 */

function addStrike(
    guildId,
    userId,
    timeoutDuration
) {

    const current =
        getStrike(
            guildId,
            userId
        );

    const nextStrike =
        Math.min(
            current.strikes + 1,
            3
        );

    const timeoutUntil =
        Date.now() +
        timeoutDuration;

    strikes.set(
        current.key,
        {
            strikes:
                nextStrike,

            lastViolation:
                Date.now(),

            timeoutUntil:
                timeoutUntil
        }
    );

    return nextStrike;

}


/*
 * ============================================================
 * FORMAT TIME
 * ============================================================
 */

function formatDuration(
    milliseconds
) {

    const minutes =
        Math.round(
            milliseconds / 60000
        );

    if (
        minutes < 60
    ) {
        return `${minutes} minute${minutes === 1 ? "" : "s"}`;
    }

    const hours =
        Math.round(
            minutes / 60
        );

    if (
        hours < 24
    ) {
        return `${hours} hour${hours === 1 ? "" : "s"}`;
    }

    return "1 day";

}


/*
 * ============================================================
 * MAIN FILTER
 * ============================================================
 */

module.exports = {

    async handle(
        client,
        message
    ) {

        /*
         * Ignore invalid messages.
         */

        if (
            !message ||
            !message.author ||
            message.author.bot
        ) {
            return false;
        }


        /*
         * Guild only.
         */

        if (
            !message.guild
        ) {
            return false;
        }


        /*
         * Ignore empty messages.
         */

        if (
            !message.content ||
            !message.content.trim()
        ) {
            return false;
        }


        /*
         * Get filter configuration.
         */

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


        /*
         * Filter isn't configured/enabled.
         */

        if (
            !filter ||
            !filter.enabled ||
            !Array.isArray(filter.words) ||
            !filter.words.length
        ) {
            return false;
        }


        /*
         * Find matching blocked word.
         */

        const matchedWord =
            filter.words.find(
                word =>
                    matchesWord(
                        message.content,
                        word
                    )
            );


        /*
         * Nothing detected.
         */

        if (
            !matchedWord
        ) {
            return false;
        }


        /*
         * Get member.
         */

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


        /*
         * Never punish administrators.
         */

        const isAdministrator =
            member &&
            member.permissions.has(
                PermissionFlagsBits.Administrator
            );


        /*
         * Delete the offending message.
         */

        try {

            await message.delete();

        } catch (error) {

            console.error(
                "[TEXT FILTER] Failed to delete message:",
                error
            );

        }


        /*
         * Administrators still have their
         * message removed, but aren't timed out.
         */

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


        /*
         * Get current strike.
         */

        const current =
            getStrike(
                message.guild.id,
                message.author.id
            );


        /*
         * IMPORTANT:
         *
         * If the user is already inside the
         * current punishment window, don't
         * repeatedly re-timeout them.
         *
         * We still delete their messages.
         */

        if (
            current.timeoutUntil &&
            Date.now() <
                current.timeoutUntil
        ) {

            return true;

        }


        /*
         * Determine next timeout.
         */

        const strikeNumber =
            Math.min(
                current.strikes + 1,
                3
            );

        const timeoutDuration =
            TIMEOUTS[
                strikeNumber - 1
            ];


        /*
         * Add strike.
         */

        addStrike(
            message.guild.id,
            message.author.id,
            timeoutDuration
        );


        /*
         * Apply timeout.
         */

        let timeoutApplied =
            false;

        try {

            if (
                member &&
                member.moderatable
            ) {

                await member.timeout(
                    timeoutDuration,
                    `Text filter - violation #${strikeNumber}`
                );

                timeoutApplied =
                    true;

            }

        } catch (error) {

            console.error(
                "[TEXT FILTER] Failed to timeout user:",
                error
            );

        }


        /*
         * Warning message.
         */

        try {

            const duration =
                formatDuration(
                    timeoutDuration
                );

            const description =
                timeoutApplied

                    ? `${config.emojis.error} ${message.author}: Your message was removed because it contained a blocked word. You have been timed out for **${duration}**. This is filter violation **#${strikeNumber}**.`

                    : `${config.emojis.error} ${message.author}: Your message was removed because it contained a blocked word.`;

            const embed =
                new EmbedBuilder()
                    .setColor(
                        config.colors.error
                    )
                    .setDescription(
                        description
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
