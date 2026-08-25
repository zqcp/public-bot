const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");

module.exports = {

    name: "embedButtonAdd",

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

        const components =
            Array.isArray(saved.components)
                ? saved.components
                : [];

        const buttons =
            components
                .flatMap(row =>
                    Array.isArray(row.components)
                        ? row.components
                        : []
                )
                .filter(component =>
                    component.type === 2
                );

        if (buttons.length >= 25) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        `Embed **${name}** already has the maximum number of buttons.`
                    )
                ],
                flags: 64
            });
        }

        const modal =
            new ModalBuilder()
                .setCustomId(
                    `embedButtonAddModal:${name}`
                )
                .setTitle(
                    `Add Button: ${name}`
                );

        const label =
            new TextInputBuilder()
                .setCustomId("label")
                .setLabel("Button Label")
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(true)
                .setPlaceholder(
                    "Enter button label..."
                );

        const style =
            new TextInputBuilder()
                .setCustomId("style")
                .setLabel("Button Style")
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(true)
                .setPlaceholder(
                    "Primary, Secondary, Success, Danger, Link"
                )
                .setValue("Primary");

        const url =
            new TextInputBuilder()
                .setCustomId("url")
                .setLabel("URL / Custom ID")
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(false)
                .setPlaceholder(
                    "https://example.com or custom-id"
                );

        const emoji =
            new TextInputBuilder()
                .setCustomId("emoji")
                .setLabel("Emoji")
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(false)
                .setPlaceholder(
                    "👍"
                );

        const disabled =
            new TextInputBuilder()
                .setCustomId("disabled")
                .setLabel("Disabled")
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(false)
                .setPlaceholder(
                    "true or false"
                )
                .setValue("false");

        modal.addComponents(

            new ActionRowBuilder()
                .addComponents(label),

            new ActionRowBuilder()
                .addComponents(style),

            new ActionRowBuilder()
                .addComponents(url),

            new ActionRowBuilder()
                .addComponents(emoji),

            new ActionRowBuilder()
                .addComponents(disabled)

        );

        return interaction.showModal(modal);

    }

};
