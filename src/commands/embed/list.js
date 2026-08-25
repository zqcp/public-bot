const {
    EmbedBuilder
} = require("discord.js");

const Embed = require("../../models/Embed");
const config = require("../../config");
const globalEmbeds = require("../../embeds/global");

module.exports = {

    name: "embed list",

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
            !message.member.permissions.has(
                "ManageGuild"
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
         * Get saved embeds
         */

        const savedEmbeds =
            await Embed.find({
                guildId: message.guild.id
            })
            .sort({
                name: 1
            });

        /*
         * No embeds
         */

        if (!savedEmbeds.length) {
            return message.channel.send({
                embeds: [
                    globalEmbeds.regular(
                        message.author,
                        "There are no saved embeds in this server."
                    )
                ]
            });
        }

        /*
         * Build list
         */

        const list =
            savedEmbeds
                .map(embed => {
                    return `• **${embed.name}**`;
                })
                .join("\n");

        /*
         * Saved embeds display
         */

        const listEmbed =
            new EmbedBuilder()
                .setColor(config.colors.regular)
                .setTitle("Saved Embeds")
                .setAuthor({
                    name: message.guild.name,
                    iconURL: message.guild.iconURL({
                        dynamic: true
                    }) || undefined
                })
                .setDescription(list);

        return message.channel.send({
            embeds: [
                listEmbed
            ]
        });

    }

};
