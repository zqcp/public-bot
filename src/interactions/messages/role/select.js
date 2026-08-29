const {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} = require("discord.js");

const RolePanel =
    require("../../../models/RolePanel");

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

        const panel =
            await RolePanel.findOne({
                guildId:
                    interaction.guild.id,
                messageId:
                    interaction.message.id
            });

        if (!panel) {
            return interaction.reply({
                content:
                    "This role panel is no longer configured.",
                flags: 64
            });
        }

        const roles =
            panel.roles || [];

        if (!roles.length) {
            return interaction.reply({
                content:
                    "No roles have been added to this panel.",
                flags: 64
            });
        }

        const options =
            roles
                .map(role => {

                    const discordRole =
                        interaction.guild.roles.cache.get(
                            role.roleId
                        );

                    if (!discordRole) {
                        return null;
                    }

                    return new StringSelectMenuOptionBuilder()
                        .setLabel(
                            role.name || discordRole.name
                        )
                        .setValue(
                            role.roleId
                        )
                        .setDescription(
                            `Role ID: ${role.roleId}`
                        );

                })
                .filter(Boolean);

        if (!options.length) {
            return interaction.reply({
                content:
                    "None of the configured roles exist anymore.",
                flags: 64
            });
        }

        const menu =
            new StringSelectMenuBuilder()
                .setCustomId(
                    `roleSelect:${panel.messageId}`
                )
                .setPlaceholder(
                    panel.placeholder ||
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
                    options.slice(0, 25)
                );

        return interaction.update({
            components: [
                new ActionRowBuilder()
                    .addComponents(menu)
            ]
        });

    }

};
