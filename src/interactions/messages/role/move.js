const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

module.exports = {

    name: "roleMove",

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

        const roleId =
            parts[2];

        if (
            !name ||
            !roleId
        ) {

            return interaction.reply({
                content:
                    "Invalid role configuration.",
                flags: 64
            });

        }

        const role =
            interaction.guild.roles.cache.get(
                roleId
            );

        if (!role) {

            return interaction.reply({
                content:
                    "That role no longer exists.",
                flags: 64
            });

        }

        const input =
            new TextInputBuilder()
                .setCustomId(
                    "position"
                )
                .setLabel(
                    "Selector position"
                )
                .setPlaceholder(
                    "Enter a position from 1 to 25..."
                )
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(
                    true
                )
                .setMaxLength(
                    2
                );

        const modal =
            new ModalBuilder()
                .setCustomId(
                    `roleMoveModal:${name}:${role.id}`
                )
                .setTitle(
                    "Move Role"
                );

        modal.addComponents(

            new ActionRowBuilder()
                .addComponents(
                    input
                )

        );

        return interaction.showModal(
            modal
        );

    }

};
