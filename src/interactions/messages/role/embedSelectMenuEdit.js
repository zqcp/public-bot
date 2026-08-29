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

        if (
            parts[1] !== "roles" ||
            parts[2] !== "role"
        ) {
            return interaction.reply({
                content:
                    "Invalid role editor.",
                flags: 64
            });
        }

        const input =
            new TextInputBuilder()
                .setCustomId("roleId")
                .setLabel("Role ID")
                .setPlaceholder(
                    "Enter the role ID..."
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
                .setTitle("Select Role");

        modal.addComponents(
            new ActionRowBuilder()
                .addComponents(input)
        );

        return interaction.showModal(
            modal
        );

    }

};
