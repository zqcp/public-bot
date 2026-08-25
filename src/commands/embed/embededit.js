const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const config = require("../../config");

const GlobalEmbed = require("../../embeds/global");
const HelpEmbed = require("../../embeds/help/embed");
const MessageStorage = require("../../systems/messages/storage");

module.exports = {

    name: "embed edit",

    async execute(cilent, message, args) {

        // ==========================================
        // PERMISSION
        // ==========================================

        if (
            !message.member.permissions.has(
                "ManageGuild"
            )
        ) {
            return message.channel.send({
                embeds: [
                    GlobalEmbed.permission(
                        message.author,
                        "Manage Server"
                    )
                ]
            });
        }


        // ==========================================
        // HELP
        // ==========================================

        if (!args.length) {
            return message.channel.send({
                embeds: [
                    HelpEmbed.edit(
                        message.author
                    )
                ]
            });
        }


        // ==========================================
        // MESSAGE NAME
        // ==========================================

        const name = args[0]
            .toLowerCase()
            .trim();

        if (!/^[a-z0-9_-]+$/i.test(name)) {
            return message.channel.send({
                embeds: [
                    GlobalEmbed.error(
                        "The message name can only contain letters, numbers, `_`, and `-`."
                    )
                ]
            });
        }


        // ==========================================
        // GET SAVED MESSAGE
        // ==========================================

        const saved =
            await MessageStorage.get(
                message.guild.id,
                name
            );

        if (!saved) {
            return message.channel.send({
                embeds: [
                    GlobalEmbed.error(
                        `I couldn't find a saved embed named \`${name}\`.`
                    )
                ]
            });
        }


        // ==========================================
        // BUILDER
        // ==========================================

        const builderEmbed = new EmbedBuilder()
            .setColor(
                config.colors.regular
            )
            .setTitle(`Editing: ${name}`)
            .setDescription(
                "Use the buttons below to edit this message."
            );


        // ==========================================
        // ROW 1
        // ==========================================

        const row1 = new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId(
                        `embed_edit_content:${name}`
                    )
                    .setLabel("Content")
                    .setStyle(
                        ButtonStyle.Secondary
                    ),

                new ButtonBuilder()
                    .setCustomId(
                        `embed_edit_embed:${name}`
                    )
                    .setLabel("Embed")
                    .setStyle(
                        ButtonStyle.Secondary
                    ),

                new ButtonBuilder()
                    .setCustomId(
                        `embed_edit_author:${name}`
                    )
                    .setLabel("Author")
                    .setStyle(
                        ButtonStyle.Secondary
                    ),

                new ButtonBuilder()
                    .setCustomId(
                        `embed_edit_fields:${name}`
                    )
                    .setLabel("Fields")
                    .setStyle(
                        ButtonStyle.Secondary
                    ),

                new ButtonBuilder()
                    .setCustomId(
                        `embed_edit_footer:${name}`
                    )
                    .setLabel("Footer")
                    .setStyle(
                        ButtonStyle.Secondary
                    )
            );


        // ==========================================
        // ROW 2
        // ==========================================

        const row2 = new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId(
                        `embed_edit_images:${name}`
                    )
                    .setLabel("Images")
                    .setStyle(
                        ButtonStyle.Secondary
                    ),

                new ButtonBuilder()
                    .setCustomId(
                        `embed_edit_buttons:${name}`
                    )
                    .setLabel("Buttons")
                    .setStyle(
                        ButtonStyle.Secondary
                    ),

                new ButtonBuilder()
                    .setCustomId(
                        `embed_edit_selects:${name}`
                    )
                    .setLabel("Select Menus")
                    .setStyle(
                        ButtonStyle.Secondary
                    ),

                new ButtonBuilder()
                    .setCustomId(
                        `embed_edit_preview:${name}`
                    )
                    .setLabel("Preview")
                    .setStyle(
                        ButtonStyle.Primary
                    ),

                new ButtonBuilder()
                    .setCustomId(
                        `embed_edit_save:${name}`
                    )
                    .setLabel("Save")
                    .setStyle(
                        ButtonStyle.Success
                    )
            );


        // ==========================================
        // SEND BUILDER
        // ==========================================

        return message.channel.send({
            embeds: [
                builderEmbed
            ],
            components: [
                row1,
                row2
            ]
        });
    }
};
