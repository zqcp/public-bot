const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = {

    name: "roleAdd",

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

        if (
            !interaction.member.manageable ||
            role.position >= interaction.guild.members.me.roles.highest.position
        ) {
            return interaction.reply({
                content: "I cannot manage that role.",
                flags: 64
            });
        }

        try {

            if (
                interaction.member.roles.cache.has(
                    role.id
                )
            ) {
                return interaction.reply({
                    content: `You already have **${role.name}**.`,
                    flags: 64
                });
            }

            await interaction.member.roles.add(role);

            return interaction.reply({
                content: `Added **${role.name}** to you.`,
                flags: 64
            });

        } catch (error) {

            console.error(
                "[ROLE ADD]",
                error
            );

            return interaction.reply({
                content: "I couldn't add that role.",
                flags: 64
            });

        }

    }

};
