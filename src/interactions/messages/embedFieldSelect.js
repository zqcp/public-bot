const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");

module.exports = {

    name: "embedFieldSelect",

    type: "select",

    async execute(client, interaction) {

        if (!interaction.guild) {
            return;
        }

        const [, name] =
            interaction.customId.split(":");

        const fieldIndex =
            Number(interaction.values[0]);

        if (
            !name ||
            Number.isNaN(fieldIndex)
        ) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "I couldn't determine which field you're editing."
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

        const fields =
            Array.isArray(saved.embeds?.[0]?.fields)
                ? saved.embeds[0].fields
                : [];

        const field =
            fields[fieldIndex];

        if (!field) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "I couldn't find that field."
                    )
                ],
                flags: 64
            });
        }

        const modal =
            new ModalBuilder()
                .setCustomId(
                    `embedFieldEditModal:${name}:${fieldIndex}`
                )
                .setTitle(
                    `Edit Field ${fieldIndex + 1}`
                );

        const fieldName =
            new TextInputBuilder()
                .setCustomId("name")
                .setLabel("Field Name")
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(true)
                .setValue(
                    field.name || ""
                );

        const value =
            new TextInputBuilder()
                .setCustomId("value")
                .setLabel("Field Value")
                .setStyle(
                    TextInputStyle.Paragraph
                )
                .setRequired(true)
                .setValue(
                    field.value || ""
                );

        const inline =
            new TextInputBuilder()
                .setCustomId("inline")
                .setLabel("Inline")
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(false)
                .setValue(
                    field.inline
                        ? "true"
                        : "false"
                );

        modal.addComponents(

            new ActionRowBuilder()
                .addComponents(fieldName),

            new ActionRowBuilder()
                .addComponents(value),

            new ActionRowBuilder()
                .addComponents(inline)

        );

        return interaction.showModal(modal);

    }

};
