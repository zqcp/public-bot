const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");

module.exports = {

    name: "embedSelectMenuEditSelect",

    type: "select",

    async execute(client, interaction) {

        if (!interaction.guild) {
            return;
        }

        const parts =
            interaction.customId.split(":");

        const name =
            parts[1];

        const type =
            parts[2];

        const value =
            interaction.values[0];

        const [rowIndex, componentIndex] =
            value.split(":").map(Number);

        if (
            !name ||
            !type ||
            Number.isNaN(rowIndex) ||
            Number.isNaN(componentIndex)
        ) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "I couldn't determine which select menu you're editing."
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

        const menu =
            saved.components?.[rowIndex]
                ?.components?.[componentIndex];

        if (!menu) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "I couldn't find that select menu."
                    )
                ],
                flags: 64
            });
        }

        const placeholder =
            new TextInputBuilder()
                .setCustomId("placeholder")
                .setLabel("Placeholder")
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
                .setValue(
                    menu.placeholder ||
                    "Select something..."
                );

        const customId =
            new TextInputBuilder()
                .setCustomId("customId")
                .setLabel("Custom ID")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setValue(
                    menu.custom_id ||
                    ""
                );

        const disabled =
            new TextInputBuilder()
                .setCustomId("disabled")
                .setLabel("Disabled")
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
                .setValue(
                    menu.disabled
                        ? "true"
                        : "false"
                );

        const modal =
            new ModalBuilder()
                .setCustomId(
                    `embedSelectMenuEditModal:${name}:${type}:${rowIndex}:${componentIndex}`
                )
                .setTitle(
                    `Edit ${type} Select`
                );

        modal.addComponents(

            new ActionRowBuilder()
                .addComponents(
                    placeholder
                ),

            new ActionRowBuilder()
                .addComponents(
                    customId
                ),

            new ActionRowBuilder()
                .addComponents(
                    disabled
                )

        );

        return interaction.showModal(modal);

    }

};
