const {
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const globalEmbeds = require("../../embeds/global");
const config = require("../../config");

module.exports = {

    name: "nuke",

    aliases: ["n"],

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
         * Clear channel
         */

        try {

            let deleted;

            do {

                deleted =
                    await message.channel.bulkDelete(
                        100,
                        true
                    );

            } while (deleted.size === 100);

            /*
             * First message
             */

            return message.channel.send({
                content: "First"
            });

        } catch (error) {

            console.error(
                "[NUKE] Failed to clear channel:",
                error
            );

            /*
             * Failed embed
             */

            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(config.colors.failed)
                        .setDescription(
                            `${config.emojis.failed} ${message.author}: Nuke failed. Please try again.`
                        )
                ]
            }).catch(() => {});

        }

    }

};
