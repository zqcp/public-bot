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

        const name =
            interaction.customId.split(":")[1];

        if (!name) {

            return interaction.reply({
                content:
                    "I couldn't determine which embed you're editing.",
                flags: 64
            });

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
                    `roleIdModal:${name}`
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
