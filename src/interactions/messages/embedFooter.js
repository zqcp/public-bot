const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");

module.exports = {

    name: "embedFooter",

    type: "button",

    async execute(client, interaction) {

        if (!interaction.guild) {
            return;
        }

        const [, name] =
            interaction.customId.split(":");

        if (!name) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "I couldn't determine which embed you're editing."
                    )
                ],
                flags: 64
            });
        }

        const saved =
            await Embed.findOne({
                guildId: interaction.guild.id,
                name
            });

        if (!saved) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        `I couldn't find an embed named **${name}**.`
                    )
                ],
                flags: 64
            });
        }

        if (
            !Array.isArray(saved.embeds) ||
            !saved.embeds.length
        ) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        `Embed **${name}** doesn't have an embed to edit yet.`
                    )
                ],
                flags: 64
            });
        }

        const footer =
            saved.embeds[0].footer || {};

        const modal =
            new ModalBuilder()
                .setCustomId(
                    `embedFooterModal:${name}`
                )
                .setTitle(
                    `Edit Footer: ${name}`
                );

        const text =
            new TextInputBuilder()
                .setCustomId("text")
                .setLabel("Footer Text")
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(false)
                .setPlaceholder(
                    "Enter footer text..."
                )
                .setValue(
                    footer.text || ""
                );

        const iconURL =
            new TextInputBuilder()
                .setCustomId("iconURL")
                .setLabel("Footer Icon URL")
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(false)
                .setPlaceholder(
                    "https://example.com/icon.png"
                )
                .setValue(
                    footer.icon_url ||
                    footer.iconURL ||
                    ""
                );

        modal.addComponents(

            new ActionRowBuilder()
                .addComponents(text),

            new ActionRowBuilder()
                .addComponents(iconURL)

        );

        return interaction.showModal(modal);

    }

};
