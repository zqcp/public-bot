const {
    PermissionFlagsBits
} = require("discord.js");

module.exports = {

    name: "roleEditModal",

    type: "modal",

    async execute(
        client,
        interaction
    ) {

        if (!interaction.guild) {
            return;
        }

        if (
            !interaction.member.permissions.has(
                PermissionFlagsBits.ManageRoles
            )
        ) {

            return interaction.reply({
                content:
                    "You need the **Manage Roles** permission.",
                flags: 64
            });

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

        if (role.managed) {

            return interaction.reply({
                content:
                    "That role cannot be managed.",
                flags: 64
            });

        }

        const botMember =
            interaction.guild.members.me;

        if (!botMember) {

            return interaction.reply({
                content:
                    "I couldn't determine my server member.",
                flags: 64
            });

        }

        if (
            role.position >=
            botMember.roles.highest.position
        ) {

            return interaction.reply({
                content:
                    "I cannot edit that role because it is higher than or equal to my highest role.",
                flags: 64
            });

        }

        const name =
            interaction.fields
                .getTextInputValue(
                    "name"
                )
                .trim();

        if (!name) {

            return interaction.reply({
                content:
                    "Please provide a role name.",
                flags: 64
            });

        }

        try {

            await role.setName(
                name
            );

            return interaction.reply({

                content:
                    `Role renamed to **${role.name}**.`,

                flags: 64

            });

        } catch (error) {

            console.error(
                "[ROLE EDIT]",
                error
            );

            return interaction.reply({

                content:
                    "I couldn't edit that role.",

                flags: 64

            });

        }

    }

};
