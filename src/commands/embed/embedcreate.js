const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const config = require("../../config");

const GlobalEmbed = require("../../embeds/global");
const HelpEmbed = require("../../embeds/help/embed");

module.exports = {

    name: "embed create",

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
                    HelpEmbed.create(
                        message.author
                    )
                ]
            });
        }


        // ==========================================
        // BUILDER EMBED
        // ==========================================

        const builderEmbed = new EmbedBuilder()
            .setColor(
                config.colors.regular
            )
            .setDescription(
                "Configure your message using the buttons below."
            );


        // ==========================================
        // ROW 1
        // ==========================================

        const row1 = new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId(
                        "embed_content"
                    )
                    .setLabel("Content")
                    .setStyle(
                        ButtonStyle.Secondary
                    ),

                new ButtonBuilder()
                    .setCustomId(
                        "embed_embed"
                    )
                    .setLabel("Embed")
                    .setStyle(
                        ButtonStyle.Secondary
                    ),

                new ButtonBuilder()
                    .setCustomId(
                        "embed_author"
                    )
                    .setLabel("Author")
                    .setStyle(
                        ButtonStyle.Secondary
                    ),

                new ButtonBuilder()
                    .setCustomId(
                        "embed_fields"
                    )
                    .setLabel("Fields")
                    .setStyle(
                        ButtonStyle.Secondary
                    ),

                new ButtonBuilder()
                    .setCustomId(
                        "embed_footer"
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
                        "embed_images"
                    )
                    .setLabel("Images")
                    .setStyle(
                        ButtonStyle.Secondary
                    ),

                new ButtonBuilder()
                    .setCustomId(
                        "embed_buttons"
                    )
                    .setLabel("Buttons")
                    .setStyle(
                        ButtonStyle.Secondary
                    ),

                new ButtonBuilder()
                    .setCustomId(
                        "embed_selects"
                    )
                    .setLabel("Select Menus")
                    .setStyle(
                        ButtonStyle.Secondary
                    ),

                new ButtonBuilder()
                    .setCustomId(
                        "embed_preview"
                    )
                    .setLabel("Preview")
                    .setStyle(
                        ButtonStyle.Primary
                    ),

                new ButtonBuilder()
                    .setCustomId(
                        "embed_save"
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
