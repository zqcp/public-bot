const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");

const styles = {
    1: "Primary",
    2: "Secondary",
    3: "Success",
    4: "Danger",
    5: "Link"
};

module.exports = {

    name: "embedButtonSelect",

    type: "select",

    async execute(client, interaction) {

        if (!interaction.guild) {
            return;
        }

        const [, name] =
            interaction.customId.split(":");

        const value =
            interaction.values[0];

        const [rowIndex, buttonIndex] =
            value.split(":").map(Number);

        if (
            !name ||
            Number.isNaN(rowIndex) ||
            Number.isNaN(buttonIndex)
        ) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "I couldn't determine which button you're editing."
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

        const button =
            saved.components?.[rowIndex]
                ?.components?.[buttonIndex];

        if (
            !button ||
            button.type !== 2
        ) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "I couldn't find that button."
                    )
                ],
                flags: 64
            });
        }

        const modal =
            new ModalBuilder()
                .setCustomId(
                    `embedButtonEditModal:${name}:${rowIndex}:${buttonIndex}`
                )
                .setTitle(
                    `Edit Button`
                );

        const label =
            new TextInputBuilder()
                .setCustomId("label")
                .setLabel("Button Label")
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(false)
                .setValue(
                    button.label || ""
                );

        const style =
            new TextInputBuilder()
                .setCustomId("style")
                .setLabel("Button Style")
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(true)
                .setValue(
                    styles[button.style] ||
                    "Primary"
                );

        const urlOrId =
            new TextInputBuilder()
                .setCustomId("url")
                .setLabel("URL / Custom ID")
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(false)
                .setValue(
                    button.url ||
                    button.custom_id ||
                    ""
                );

        const emoji =
            new TextInputBuilder()
                .setCustomId("emoji")
                .setLabel("Emoji")
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(false)
                .setValue(
                    button.emoji?.name ||
                    button.emoji?.id ||
                    ""
                );

        const disabled =
            new TextInputBuilder()
                .setCustomId("disabled")
                .setLabel("Disabled")
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(false)
                .setValue(
                    button.disabled
                        ? "true"
                        : "false"
                );

        modal.addComponents(

            new ActionRowBuilder()
                .addComponents(label),

            new ActionRowBuilder()
                .addComponents(style),

            new ActionRowBuilder()
                .addComponents(urlOrId),

            new ActionRowBuilder()
                .addComponents(emoji),

            new ActionRowBuilder()
                .addComponents(disabled)

        );

        return interaction.showModal(modal);

    }

};
