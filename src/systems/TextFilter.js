// src/systems/textFilter.js

const {
    PermissionFlagsBits
} = require("discord.js");

const Filter =
    require("../models/TextFilter");

module.exports = {

    async handle(
        client,
        message
    ) {

        /*
         * Ignore bots
         */

        if (
            message.author.bot
        ) {
            return;
        }

        /*
         * Guild only
         */

        if (
            !message.guild
        ) {
            return;
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

            return;
        }

        /*
         * Filter doesn't exist
         */

        if (
            !filter ||
            !filter.enabled ||
            !filter.words.length
        ) {
            return;
        }

        /*
         * Check message
         */

        const content =
            message.content
                .toLowerCase();

        const matchedWord =
            filter.words.find(
                word =>
                    content.includes(
                        word.toLowerCase()
                    )
            );

        if (
            !matchedWord
        ) {
            return;
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

            return;
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
         * Warning message
         */

        try {

            await message.channel.send({
                content:
                    `⚠️ ${message.author}: Your message was removed because it contained a blocked word. You have been timed out for 10 minutes.`
            });

        } catch (error) {

            console.error(
                "[TEXT FILTER] Failed to send warning:",
                error
            );

        }

    }

};
