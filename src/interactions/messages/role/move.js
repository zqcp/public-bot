const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

module.exports = {

    name: "roleMove",

    type: "button",

    async execute(client, interaction) {

        if (!interaction.guild) return;

        const roleId =
            interaction.customId.split(":")[1];

        const role =
            interaction.guild.roles.cache.get(
                roleId
            );

        if (!role) {
            return interaction.reply({
                content: "That role no longer exists.",
                flags: 64
            });
        }

        const position =
            new TextInputBuilder()
                .setCustomId("position")
                .setLabel("Role position")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("1")
                .setRequired(true);

        const modal =
            new ModalBuilder()
                .setCustomId(
                    `roleMoveModal:${role.id}`
                )
                .setTitle("Move Role");

        modal.addComponents(
            new ActionRowBuilder()
                .addComponents(position)
        );

        return interaction.showModal(modal);

    }

};
