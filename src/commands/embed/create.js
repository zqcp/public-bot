const Embed = require("../../models/Embed");
const helpEmbed = require("../../embeds/help/embed");
const globalEmbeds = require("../../embeds/global");

module.exports = {

    name: "embed create",

    aliases: [],

    permissions: {
        user: ["ManageGuild"],
        bot: ["ManageGuild"]
    },

    async execute(client, message, args) {

        if (!message.guild) {
            return;
        }

        /*
         * User permission
         */

        if (
            !message.member.permissions.has("ManageGuild")
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
         * Bot permission
         */

        if (
            !message.guild.members.me.permissions.has(
                "ManageGuild"
            )
        ) {
            return message.channel.send({
                embeds: [
                    globalEmbeds.botPermission(
                        message.author,
                        ["ManageGuild"]
                    )
                ]
            });
        }

        /*
         * Help
         *
         * Permission is valid, but no name
         * was provided.
         */

        const name = args
            .join(" ")
            .trim()
            .toLowerCase();

        if (!name) {
            return message.channel.send({
                embeds: [
                    helpEmbed.create(
                        message.author
                    )
                ]
            });
        }

        /*
         * Check if the embed already exists.
         */

        const existing =
            await Embed.findOne({
                guildId: message.guild.id,
                name
            });

        if (existing) {
            return message.channel.send({
                embeds: [
                    globalEmbeds.error(
                        `${message.author}: An embed named **${name}** already exists.`
                    )
                ]
            });
        }

        /*
         * Create a completely new embed.
         *
         * Existing information is NOT copied here.
         * Editing an existing embed will preserve
         * its information.
         */

        await Embed.create({
            guildId: message.guild.id,
            name,
            content: null,
            embeds: [],
            components: []
        });

        /*
         * Success
         */

        return message.channel.send({
            embeds: [
                globalEmbeds.regular(
                    `${message.author}: Embed **${name}** has been created successfully.`
                )
            ]
        });

    }

};
