module.exports = {

    name: "roleRemove",

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
            role.position >=
            interaction.guild.members.me.roles.highest.position
        ) {
            return interaction.reply({
                content: "I cannot manage that role.",
                flags: 64
            });
        }

        try {

            if (
                !interaction.member.roles.cache.has(
                    role.id
                )
            ) {
                return interaction.reply({
                    content: `You don't have **${role.name}**.`,
                    flags: 64
                });
            }

            await interaction.member.roles.remove(role);

            return interaction.reply({
                content: `Removed **${role.name}** from you.`,
                flags: 64
            });

        } catch (error) {

            console.error(
                "[ROLE REMOVE]",
                error
            );

            return interaction.reply({
                content: "I couldn't remove that role.",
                flags: 64
            });

        }

    }

};
