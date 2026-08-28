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
 * Normalize text so common filter bypasses
 * are easier to detect.
 */
function normalizeText(text) {

    if (!text) {
        return "";
    }

    return text
        .normalize("NFKD")
        .toLowerCase()

        /*
         * Common leetspeak substitutions
         */
        .replace(/[@4]/g, "a")
        .replace(/[8]/g, "b")
        .replace(/[3]/g, "e")
        .replace(/[6]/g, "g")
        .replace(/[1!|]/g, "i")
        .replace(/[0]/g, "o")
        .replace(/[5$]/g, "s")
        .replace(/[7]/g, "t")
        .replace(/[2]/g, "z")

        /*
         * Remove combining Unicode marks
         */
        .replace(/[\u0300-\u036f]/g, "")

        /*
         * Remove punctuation, symbols and spaces
         */
        .replace(/[\W_]+/g, "")

        /*
         * Collapse repeated characters.
         *
         * Example:
         * baaad -> bad
         * heyyy -> hey
         */
        .replace(/(.)\1{2,}/g, "$1");

}


/*
 * Create a version that keeps spaces between
 * characters but removes punctuation.
 *
 * This helps catch:
 *
 * b a d
 * b.a.d
 * b-a-d
 */
function normalizeLooseText(text) {

    if (!text) {
        return "";
    }

    return text
        .normalize("NFKD")
        .toLowerCase()
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[@4]/g, "a")
        .replace(/[8]/g, "b")
        .replace(/[3]/g, "e")
        .replace(/[6]/g, "g")
        .replace(/[1!|]/g, "i")
        .replace(/[0]/g, "o")
        .replace(/[5$]/g, "s")
        .replace(/[7]/g, "t")
        .replace(/[2]/g, "z")
        .replace(/[^\p{L}\p{N}\s]/gu, "")
        .replace(/\s+/g, " ")
        .trim();

}


/*
 * Build a version with whitespace removed.
 */
function removeSpaces(text) {

    return text
        .replace(/\s+/g, "");

}


module.exports = {

    async handle(
        client,
        message
    ) {

        /*
         * Ignore bots
         */

        if (
            !message ||
            !message.author ||
            message.author.bot
        ) {
            return false;
        }

        /*
         * Guild only
         */

        if (
            !message.guild
        ) {
            return false;
        }

        /*
         * Ignore empty messages
         */

        if (
            !message.content ||
            !message.content.trim()
        ) {
            return false;
        }

        /*
         * Find filter
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
         * Filter doesn't exist
         * or is disabled
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
         * Prepare message
         */

        const originalContent =
            message.content.toLowerCase();

        const normalizedContent =
            normalizeText(
                message.content
            );

        const looseContent =
            normalizeLooseText(
                message.content
            );

        const spaceFreeContent =
            removeSpaces(
                looseContent
            );

        /*
         * Find matching blocked word
         */

        const matchedWord =
            filter.words.find(
                storedWord => {

                    if (
                        !storedWord ||
                        !storedWord.trim()
                    ) {
                        return false;
                    }

                    const word =
                        storedWord
                            .trim()
                            .toLowerCase();

                    /*
                     * Normalize the blocked word
                     */

                    const normalizedWord =
                        normalizeText(
                            word
                        );

                    const looseWord =
                        normalizeLooseText(
                            word
                        );

                    const spaceFreeWord =
                        removeSpaces(
                            looseWord
                        );

                    /*
                     * Exact normal match
                     */

                    if (
                        originalContent.includes(
                            word
                        )
                    ) {
                        return true;
                    }

                    /*
                     * Aggressive normalized match
                     */

                    if (
                        normalizedWord &&
                        normalizedContent.includes(
                            normalizedWord
                        )
                    ) {
                        return true;
                    }

                    /*
                     * Punctuation / spacing bypass
                     */

                    if (
                        spaceFreeWord &&
                        spaceFreeContent.includes(
                            spaceFreeWord
                        )
                    ) {
                        return true;
                    }

                    return false;

                }
            );

        /*
         * Nothing detected
         */

        if (
            !matchedWord
        ) {
            return false;
        }

        /*
         * Delete message
         */

        try {

            await message.delete();

        } catch (error) {

            console.error(
                "[TEXT FILTER] Failed to delete message:",
                error
            );

            return false;
        }

        /*
         * Timeout user
         */

        try {

            const member =
                message.member ||
                await message.guild.members.fetch(
                    message.author.id
                );

            /*
             * Don't timeout administrators.
             */

            if (
                member &&
                member.moderatable &&
                !member.permissions.has(
                    PermissionFlagsBits.Administrator
                )
            ) {

                await member.timeout(
                    10 * 60 * 1000,
                    "Text filter"
                );

            }

        } catch (error) {

            console.error(
                "[TEXT FILTER] Failed to timeout user:",
                error
            );

        }

        /*
         * Warning embed
         */

        try {

            const embed =
                new EmbedBuilder()
                    .setColor(
                        config.colors.error
                    )
                    .setDescription(
                        `${config.emojis.error} ${message.author}: Your message was removed because it contained a blocked word. You have been timed out for 10 minutes.`
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
