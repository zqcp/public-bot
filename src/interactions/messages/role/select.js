module.exports = {

    name: "roleSelect",

    type: "selectMenu",

    async execute(
        client,
        interaction
    ) {

        if (!interaction.guild) {
            return;
        }

        const roleId =
            interaction.values[0];

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
                `Selected **${role.name}**\nRole ID: \`${role.id}\``,
            flags: 64
        });

    }

};
