module.exports = {

    name: "roleAdd",

    type: "button",

    async execute(
        client,
        interaction
    ) {

        if (!interaction.guild) {
            return;
        }

        const roleId =
            interaction.customId.split(":")[1];

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

        return interaction.reply({
            content:
                `Added **${role.name}**\nRole ID: \`${role.id}\``,
            flags: 64
        });

    }

};
