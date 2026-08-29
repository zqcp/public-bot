const {
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ActionRowBuilder
} = require("discord.js");

module.exports = {

    name: "embedSelectMenuEdit",

    type: "selectMenu",

    async execute(
        client,
        interaction
    ) {

        if (!interaction.guild) {
            return;
        }

        const roles =
            interaction.guild.roles.cache
                .filter(role =>
                    role.id !== interaction.guild.id &&
                    !role.managed
                )
                .sort(
                    (a, b) =>
                        b.position - a.position
                )
                .first(25);

        const options =
            roles.map(
                role =>
                    new StringSelectMenuOptionBuilder()
                        .setLabel(
                            role.name.slice(0, 100)
                        )
                        .setDescription(
                            `Role ID: ${role.id}`.slice(0, 100)
                        )
                        .setValue(
                            role.id
                        )
                );

        const menu =
            new StringSelectMenuBuilder()
                .setCustomId(
                    "embedSelectMenuEdit:roles:role"
                )
                .setPlaceholder(
                    "Select your roles..."
                )
                .setMinValues(1)
                .setMaxValues(
                    Math.min(
                        options.length,
                        25
                    )
                )
                .addOptions(
                    options
                );

        return interaction.update({
            components: [
                new ActionRowBuilder()
                    .addComponents(menu)
            ]
        });

    }

};
