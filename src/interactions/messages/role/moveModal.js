const {
    PermissionFlagsBits
} = require("discord.js");

module.exports = {

    name: "roleMoveModal",

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

        const position =
            Number(
                interaction.fields
                    .getTextInputValue("position")
                    .trim()
            );

        if (
            !Number.isInteger(position) ||
            position < 1
        ) {
            return interaction.reply({
                content: "Please provide a valid position.",
                flags: 64
            });
        }

        const botRole =
            interaction.guild.members.me.roles.highest;

        if (
            role.position >= botRole.position
        ) {
            return interaction.reply({
                content: "I cannot move that role.",
                flags: 64
            });
        }

        try {

            await role.setPosition(
                Math.min(
                    position,
                    botRole.position - 1
                )
            );

            return interaction.reply({
                content: `Moved **${role.name}** to position **${role.position}**.`,
                flags: 64
            });

        } catch (error) {

            console.error(
                "[ROLE MOVE]",
                error
            );

            return interaction.reply({
                content: "I couldn't move that role.",
                flags: 64
            });

        }

    }

};
