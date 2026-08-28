// src/systems/clearCmds.js

const ClearCmds =
    require("../models/ClearCmds");

module.exports = {

    async handle(
        client,
        message
    ) {

        /*
         * Ignore invalid messages
         */

        if (
            !message ||
            !message.author
        ) {
            return;
        }

        /*
         * Ignore bots
         *
         * Bot messages are always kept.
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
         * Check this specific channel
         */

        let settings;

        try {

            settings =
                await ClearCmds.findOne({
                    guildId:
                        message.guild.id,

                    channelId:
                        message.channel.id
                });

        } catch (error) {

            console.error(
                "[CLEARCMDS] Database error:",
                error
            );

            return;
        }

        /*
         * Not enabled in this channel
         */

        if (
            !settings ||
            !settings.enabled
        ) {
            return;
        }

        /*
         * Delete every human message
         */

        try {

            await message.delete();

        } catch (error) {

            console.error(
                "[CLEARCMDS] Failed to delete message:",
                error
            );

        }

    }

};
