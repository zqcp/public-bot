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

        const parts =
            interaction.customId.split(":");

        const name =
            parts[1];

        if (!name) {

            return interaction.reply({
                content:
                    "I couldn't determine which embed you're editing.",
                flags: 64
            });

        }


        /*
         * OPEN ROLE ID MODAL
         *
         * This keeps the existing structure.
         * roleIdModal handles adding the
         * additional role to the selector.
         */

        const modal =
            new ModalBuilder()
                .setCustomId(
                    `roleIdModal:${name}`
                )
                .setTitle(
                    "Add Another Role"
                );


        const roleId =
            new TextInputBuilder()
                .setCustomId(
                    "roleId"
                )
                .setLabel(
                    "Role ID"
                )
                .setPlaceholder(
                    "Enter the role ID or paste the role mention..."
                )
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(
                    true
                );


        const row =
            new ActionRowBuilder()
                .addComponents(
                    roleId
                );


        modal.addComponents(
            row
        );


        return interaction.showModal(
            modal
        );

    }

};
