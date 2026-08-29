const {
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require("discord.js");

module.exports = {

    name: "roleSelect",

    type: "selectMenu",

    async execute(client, interaction) {

        if (!interaction.guild) return;

        const roles =
            interaction.guild.roles.cache
                .filter(role =>
                    role.id !== interaction.guild.id &&
                    !role.managed
                )
                .sort((a, b) =>
                    b.position - a.position
                )
                .first(25);

        if (!roles.length) {
            return interaction.reply({
                content: "No roles are available.",
                flags: 64
            });
        }

        const menu =
            new StringSelectMenuBuilder()
                .setCustomId("roleSelect")
                .setPlaceholder("Select your roles...")
                .setMinValues(1)
                .setMaxValues(
                    Math.min(roles.length, 25)
                )
                .addOptions(
                    roles.map(role => ({
                        label: role.name.slice(0, 100),
                        description: `Role ID: ${role.id}`.slice(0, 100),
                        value: role.id
                    }))
                );

        return interaction.update({
            components: [
                new ActionRowBuilder()
                    .addComponents(menu)
            ]
        });

    }

};
