// src/commands/moderation/filter/list.js

const {
    PermissionFlagsBits
} = require("discord.js");

const Filter =
    require("../../models/TextFilter");

const globalEmbeds =
    require("../../embeds/global");

const filterEmbeds =
    require("../../embeds/filter");

module.exports = {

    name: "filter list",

    aliases: [],

    permissions: {
        user: ["ManageGuild"],
        bot: []
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
                PermissionFlagsBits.ManageGuild
            )
        ) {
            return message.channel.send({
                embeds: [
                    globalEmbeds.permission(
                        message.author,
                        "Manage Server"
                    )
                ]
            });
        }

        /*
         * Find filter
         */

        const filter =
            await Filter.findOne({
                guildId: message.guild.id
            });

        /*
         * No filter

         */

        if (!filter) {
            return message.channel.send({
                embeds: [
                    filterEmbeds.list(
                        message.author,
                        []
                    )
                ]
            });
        }

        /*
         * Filter list
         */

        return message.channel.send({
            embeds: [
                filterEmbeds.list(
                    message.author,
                    filter.words
                )
            ]
        });

    }

};
