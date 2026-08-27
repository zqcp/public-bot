// src/commands/moderation/filter/enable.js

const {
    PermissionFlagsBits
} = require("discord.js");

const Filter =
    require("../../../models/TextFilter");

const globalEmbeds =
    require("../../../embeds/global");

const filterEmbeds =
    require("../../../embeds/filter");

module.exports = {

    name: "filter enable",

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
         * Enable filter
         */

        filter.enabled = true;

        await filter.save();

        /*
         * Success embed
         */

        return message.channel.send({
            embeds: [
                filterEmbeds.enabled(
                    message.author
                )
            ]
        });

    }

};
