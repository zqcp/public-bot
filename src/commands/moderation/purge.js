const {
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const globalEmbeds = require("../../embeds/global");
const moderationEmbeds = require("../../embeds/help/moderation");
const config = require("../../config");

module.exports = {

    name: "purge",

    aliases: ["p", "clear","c",],

    permissions: {
        user: ["ManageMessages"],
        bot: ["ManageMessages"]
    },

    async execute(client, message, args) {

        /*
         * Guild only
         */

        if (!message.guild) {
            return;
        }

        /*
         * User permission
         */

        if (
            !message.member.permissions.has(
                PermissionFlagsBits.ManageMessages
            )
        ) {
            return message.channel.send({
                embeds: [
                    globalEmbeds.permission(
                        message.author,
                        "Manage Messages"
                    )
                ]
            });
        }

        /*
         * Bot permission
         */

        if (
            !message.guild.members.me.permissions.has(
                PermissionFlagsBits.ManageMessages
            )
        ) {
            return message.channel.send({
                embeds: [
                    globalEmbeds.botPermission(
                        message.author,
                        ["ManageMessages"]
                    )
                ]
            });
        }

        /*
         * Amount
         */

        const amountInput = args.shift();

        if (!amountInput) {
            return message.channel.send({
                embeds: [
                    moderationEmbeds.purge(
                        message.author
                    )
                ]
            });
        }

        const amount = Number(amountInput);

        /*
         * Invalid amount
         */

        if (
            !Number.isInteger(amount) ||
            amount < 1 ||
            amount > 100
        ) {
            return message.channel.send({
                embeds: [
                    globalEmbeds.error(
                        `${message.author}: Please provide an amount between **1** and **100**.`
                    )
                ]
            });
        }

        /*
         * Purge
         */

        try {

            const deleted =
                await message.channel.bulkDelete(
                    amount,
                    true
                );

            /*
             * Success embed
             */

            const embed =
                new EmbedBuilder()
                    .setColor(config.colors.success)
                    .setDescription(
                        `${config.emojis.success} ${message.author}: Deleted **${deleted.size}** messages.`
                    );

            const response =
                await message.channel.send({
                    embeds: [embed]
                });

            /*
             * Remove the confirmation after 5 seconds.
             */

            setTimeout(() => {
                response.delete().catch(() => {});
            }, 5000);

            return response;

        } catch (error) {

            console.error(
                "[PURGE] Failed to delete messages:",
                error
            );

            /*
             * Failed embed
             */

            const embed =
                new EmbedBuilder()
                    .setColor(config.colors.failed)
                    .setDescription(
                        `${config.emojis.failed} ${message.author}: Purge failed. Please try again.`
                    );

            return message.channel.send({
                embeds: [embed]
            });
        }

    }

};
