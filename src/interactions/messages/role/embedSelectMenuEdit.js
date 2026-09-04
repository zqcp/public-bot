const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

module.exports = {

    name: "embedSelectMenuEdit",

    type: "button",

    async execute(
        client,
        interaction
    ) {

        if (!interaction.guild) {
            return;
        }

        const parts =
            interaction.customId.split(":");

        const name =
            parts[1];

        const type =
            parts[2];

        if (
            !name ||
            type !== "role"
        ) {

            return interaction.reply({
                content:
                    "Invalid role editor.",
                flags: 64
            });

        }

        const roleInput =
            new TextInputBuilder()
                .setCustomId(
                    "roleId"
                )
                .setLabel(
                    "Role ID"
                )
                .setPlaceholder(
                    "Enter the role ID..."
                )
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(
                    true
                )
                .setMaxLength(
                    20
                );

        const selectorNameInput =
            new TextInputBuilder()
                .setCustomId(
                    "selectorName"
                )
                .setLabel(
                    "Selector Name"
                )
                .setPlaceholder(
                    "Example: Colors"
                )
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(
                    true
                )
                .setMaxLength(
                    100
                );

        const placeholderInput =
            new TextInputBuilder()
                .setCustomId(
                    "placeholder"
                )
                .setLabel(
                    "Selector Placeholder"
                )
                .setPlaceholder(
                    "Example: Choose your colors..."
                )
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(
                    true
                )
                .setMaxLength(
                    150
                );

        const modal =
            new ModalBuilder()
                .setCustomId(
                    `roleSetupModal:${name}`
                )
                .setTitle(
                    "Select Role"
                );

        modal.addComponents(

            new ActionRowBuilder()
                .addComponents(
                    roleInput
                ),

            new ActionRowBuilder()
                .addComponents(
                    selectorNameInput
                ),

            new ActionRowBuilder()
                .addComponents(
                    placeholderInput
                )

        );

        return interaction.showModal(
            modal
        );

    }

};
