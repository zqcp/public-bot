const Embed = require("../../models/Embed");
const renderer = require("./renderer");

module.exports = {

    async recoverGuild(
        client,
        guildId
    ) {

        if (!client || !guildId) {
            return;
        }

        const embeds =
            await Embed.find({
                guildId
            });

        for (const embed of embeds) {

            await this.recoverEmbed(
                client,
                embed
            );

        }

    },

    async recoverEmbed(
        client,
        embed
    ) {

        if (
            !client ||
            !embed
        ) {
            return;
        }

        if (
            !Array.isArray(
                embed.messages
            )
        ) {
            return;
        }

        const payload =
            renderer.render(
                embed.toObject
                    ? embed.toObject()
                    : embed
            );

        const validMessages = [];

        for (const reference of embed.messages) {

            try {

                const channel =
                    await client.channels.fetch(
                        reference.channelId
                    );

                if (!channel) {
                    continue;
                }

                const message =
                    await channel.messages.fetch(
                        reference.messageId
                    );

                if (!message) {
                    continue;
                }

                /*
                 * The database remains the source of truth.
                 * Re-render the saved configuration into
                 * the existing Discord message.
                 */

                await message.edit(
                    payload
                );

                validMessages.push({
                    channelId:
                        reference.channelId,

                    messageId:
                        reference.messageId
                });

            } catch (error) {

                console.error(
                    `[MESSAGE RECOVERY] Failed to recover ${embed.name}:`,
                    error
                );

            }

        }

        /*
         * Remove references to messages that no
         * longer exist instead of keeping stale IDs.
         */

        if (
            validMessages.length !==
            embed.messages.length
        ) {

            embed.messages =
                validMessages;

            await embed.save();

        }

    },

    async recoverAll(client) {

        if (!client) {
            return;
        }

        const embeds =
            await Embed.find({});

        for (const embed of embeds) {

            await this.recoverEmbed(
                client,
                embed
            );

        }

    }

};
