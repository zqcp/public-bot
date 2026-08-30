const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

module.exports = {

    name: "roleAddAnother",

    type: "button",

    async execute(
        client,
        interaction
    ) {

        if (!interaction.guild) {
            return;
        }

        const input =
            new TextInputBuilder()
                .setCustomId("roleId")
                .setLabel("Role ID")
                .setPlaceholder(
                    "Enter another role ID..."
                )
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(true)
                .setMaxLength(20);

        const modal =
            new ModalBuilder()
                .setCustomId(
                    "roleIdModal"
                )
                .setTitle(
                    "Add Another Role"
                );

        modal.addComponents(
            new ActionRowBuilder()
                .addComponents(input)
        );

        return interaction.showModal(
            modal
        );

    }

};
