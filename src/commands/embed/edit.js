const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const Embed = require("../../models/Embed");
const embeds = require("../../embeds/embeds");
const helpEmbed = require("../../embeds/help/embed");
const globalEmbeds = require("../../embeds/global");

module.exports = {

    name: "embed edit",

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
         * Help
         */

        const name = args
            .join(" ")
            .trim()
            .toLowerCase();

        if (!name) {
            return message.channel.send({
                embeds: [
                    helpEmbed.edit(
                        message.author
                    )
                ]
            });
        }

        /*
         * Find saved embed
         */

        const existing =
            await Embed.findOne({
                guildId: message.guild.id,
                name
            });

        if (!existing) {
            return message.channel.send({
                embeds: [
                    embeds.error(
                        message.author,
                        `I couldn't find an embed named **${name}**.`
                    )
                ]
            });
        }

        /*
         * Make sure there is a blank embed
         * available for the editor to modify.
         */

        if (!Array.isArray(existing.embeds)) {
            existing.embeds = [];
        }

        if (!existing.embeds.length) {
            existing.embeds.push({});
            await existing.save();
        }

        /*
         * Open existing embed editor
         */

        const row =
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(
                            `embedEditor:${name}:open`
                        )
                        .setLabel("Open Editor")
                        .setStyle(
                            ButtonStyle.Primary
                        )
                );

        return message.channel.send({
            embeds: [
                embeds.success(
                    message.author,
                    `Editing embed **${name}**. Existing information will be preserved unless you explicitly remove it.`
                )
            ],
            components: [
                row
            ]
        });

    }

};
