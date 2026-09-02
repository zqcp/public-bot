const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

module.exports = {

    name: "roleEdit",

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

        const roleId =
            parts[1];

        if (!roleId) {

            return interaction.reply({
                content:
                    "Invalid role.",
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
                    "name"
                )
                .setLabel(
                    "Role name"
                )
                .setStyle(
                    TextInputStyle.Short
                )
                .setValue(
                    role.name
                )
                .setRequired(
                    true
                )
                .setMaxLength(
                    100
                );

        const modal =
            new ModalBuilder()
                .setCustomId(
                    `roleEditModal:${role.id}`
                )
                .setTitle(
                    "Edit Role"
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
