const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

module.exports = {

    name: "roleEdit",

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

        const name =
            new TextInputBuilder()
                .setCustomId("name")
                .setLabel("Role name")
                .setStyle(TextInputStyle.Short)
                .setValue(role.name)
                .setRequired(true)
                .setMaxLength(100);

        const modal =
            new ModalBuilder()
                .setCustomId(
                    `roleEditModal:${role.id}`
                )
                .setTitle("Edit Role");

        modal.addComponents(
            new ActionRowBuilder()
                .addComponents(name)
        );

        return interaction.showModal(modal);

    }

};
