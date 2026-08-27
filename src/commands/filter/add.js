// src/commands/moderation/filter/add.js

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

    name: "filter add",

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
                    helpEmbeds.add(
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

        let filter =
            await Filter.findOne({
                guildId: message.guild.id
            });

        /*
         * Create filter
         */

        if (!filter) {
            filter = await Filter.create({
                guildId: message.guild.id,
                enabled: true,
                words: []
            });
        }

        /*
         * Already filtered
         */

        if (
            filter.words.includes(word)
        ) {
            return message.channel.send({
                embeds: [
                    filterEmbeds.wordAlreadyAdded(
                        message.author,
                        word
                    )
                ]
            });
        }

        /*
         * Add word
         */

        filter.words.push(word);

        await filter.save();

        /*
         * Success embed
         */

        return message.channel.send({
            embeds: [
                filterEmbeds.wordAdded(
                    message.author,
                    word
                )
            ]
        });

    }

};
