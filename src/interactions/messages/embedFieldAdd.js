const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");

module.exports = {

    name: "embedFieldAdd",

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
                        `Embed **${name}** doesn't have an embed to add a field to yet.`
                    )
                ],
                flags: 64
            });
        }

        const fields =
            Array.isArray(saved.embeds[0].fields)
                ? saved.embeds[0].fields
                : [];

        if (fields.length >= 25) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        `Embed **${name}** already has the maximum of **25 fields**.`
                    )
                ],
                flags: 64
            });
        }

        const modal =
            new ModalBuilder()
                .setCustomId(
                    `embedFieldAddModal:${name}`
                )
                .setTitle(
                    `Add Field: ${name}`
                );

        const fieldName =
            new TextInputBuilder()
                .setCustomId("name")
                .setLabel("Field Name")
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(true)
                .setPlaceholder(
                    "Enter field name..."
                );

        const value =
            new TextInputBuilder()
                .setCustomId("value")
                .setLabel("Field Value")
                .setStyle(
                    TextInputStyle.Paragraph
                )
                .setRequired(true)
                .setPlaceholder(
                    "Enter field value..."
                );

        const inline =
            new TextInputBuilder()
                .setCustomId("inline")
                .setLabel("Inline")
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
                .addComponents(fieldName),

            new ActionRowBuilder()
                .addComponents(value),

            new ActionRowBuilder()
                .addComponents(inline)

        );

        return interaction.showModal(modal);

    }

};
