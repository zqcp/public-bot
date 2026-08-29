// src/events/channelCreate.js

const {
    ChannelType
} = require("discord.js");

const JailSystem =
    require("../systems/Jail");

module.exports = {

    name: "channelCreate",

    async execute(
        client,
        channel
    ) {

        /*
         * Guild channels only.
         */

        if (!channel.guild) {
            return;
        }

        try {

            /*
             * New category
             */

            if (
                channel.type ===
                ChannelType.GuildCategory
            ) {

                await JailSystem.syncCategory(
                    channel.guild,
                    channel
                );

                return;
            }

            /*
             * New channel
             */

            await JailSystem.syncChannel(
                channel.guild,
                channel
            );

        } catch (error) {

            console.error(
                "[JAIL] Failed to automatically sync new channel:",
                error
            );

        }

    }

};
