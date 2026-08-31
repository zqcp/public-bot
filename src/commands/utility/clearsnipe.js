const {
    PermissionFlagsBits
} = require("discord.js");

const globalEmbeds =
    require("../../embeds/global");

const Snipe =
    require("../../events/snipe");


module.exports = {

    name: "clearsnipe",

    aliases: [
        "cs"
    ],

    permissions: {
        user: ["ManageMessages"],
        bot: ["ManageMessages"]
    },

    async execute(
        client,
        message,
        args
    ) {

        /*
         * Guild only
         */

        if (
            !message.guild
        ) {
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
         * Clear snipes
         */

        const cleared =
            Snipe.clear(
                message.guild.id,
                message.channel.id
            );


        /*
         * Nothing to clear
         */

        if (
            !cleared
        ) {

            return message.channel.send({
                embeds: [
                    globalEmbeds.error(
                        `${message.author}: There is **nothing to clear** in this channel.`
                    )
                ]
            });

        }


        /*
         * Success reaction
         */

        return message.react("✅");

    }

};
