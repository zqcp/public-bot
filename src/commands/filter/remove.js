// src/commands/moderation/filter/remove.js

const {
    PermissionFlagsBits
} = require("discord.js");

const Filter =
    require("../../models/TextFilter");

const globalEmbeds =
    require("../../embeds/global");

const filterEmbeds =
    require("../../embeds/filter");

const helpEmbeds =
    require("../../embeds/help/filter");

module.exports = {

    name: "filter remove",

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
         * Help
         */

        if (!args.length) {
            return message.channel.send({
                embeds: [
                    helpEmbeds.remove(
                        message.author
                    )
                ]
            });
        }

        /*
         * Get word
         */

        const word =
            args.join(" ")
                .trim()
                .toLowerCase();

        /*
         * Find filter
         */

        const filter =
            await Filter.findOne({
                guildId: message.guild.id
            });

        /*
         * Filter doesn't exist
         */

        if (!filter) {
            return message.channel.send({
                embeds: [
                    filterEmbeds.wordNotFound(
                        message.author,
                        word
                    )
                ]
            });
        }

        /*
         * Word doesn't exist
         */

        if (
            !filter.words.includes(word)
        ) {
            return message.channel.send({
                embeds: [
                    filterEmbeds.wordNotFound(
                        message.author,
                        word
                    )
                ]
            });
        }

        /*
         * Remove word
         */

        filter.words =
            filter.words.filter(
                item => item !== word
            );

        await filter.save();

        /*
         * Success embed
         */

        return message.channel.send({
            embeds: [
                filterEmbeds.wordRemoved(
                    message.author,
                    word
                )
            ]
        });

    }

};
