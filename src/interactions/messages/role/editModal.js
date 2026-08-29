const {
    PermissionFlagsBits
} = require("discord.js");

module.exports = {

    name: "roleEditModal",

    type: "modal",

    async execute(client, interaction) {

        if (!interaction.guild) return;

        if (
            !interaction.member.permissions.has(
                PermissionFlagsBits.ManageRoles
            )
        ) {
            return interaction.reply({
                content: "You need the Manage Roles permission.",
                flags: 64
            });
        }

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
            interaction.fields
                .getTextInputValue("name")
                .trim();

        if (!name) {
            return interaction.reply({
                content: "Please provide a role name.",
                flags: 64
            });
        }

        if (
            role.position >=
            interaction.guild.members.me.roles.highest.position
        ) {
            return interaction.reply({
                content: "I cannot manage that role.",
                flags: 64
            });
        }

        try {

            await role.setName(name);

            return interaction.reply({
                content: `Role renamed to **${role.name}**.`,
                flags: 64
            });

        } catch (error) {

            console.error(
                "[ROLE EDIT]",
                error
            );

            return interaction.reply({
                content: "I couldn't edit that role.",
                flags: 64
            });

        }

    }

};
