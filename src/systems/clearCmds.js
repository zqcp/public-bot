// src/systems/clearCmds.js

const ClearCmds =
    require("../models/ClearCmds");

const config =
    require("../config");

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
         * This is important:
         * regular bot messages stay untouched.
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
         * Only check messages that
         * start with the configured prefix.
         */

        if (
            !message.content ||
            !message.content.startsWith(
                config.prefix
            )
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
         * Delete command message
         */

        try {

            await message.delete();

        } catch (error) {

            console.error(
                "[CLEARCMDS] Failed to delete command:",
                error
            );

        }

    }

};
