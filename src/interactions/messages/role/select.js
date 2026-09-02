const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

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

        const parts =
            interaction.customId.split(":");

        const name =
            parts[1];

        if (!name) {

            return interaction.reply({
                content:
                    "I couldn't determine which embed you're editing.",
                flags: 64
            });

        }

        const roleIds =
            interaction.values;

        if (
            !Array.isArray(roleIds) ||
            !roleIds.length
        ) {

            return interaction.reply({
                content:
                    "Please select at least one role.",
                flags: 64
            });

        }

        const roles =
            roleIds
                .map(
                    roleId =>
                        interaction.guild.roles.cache.get(
                            roleId
                        )
                )
                .filter(Boolean);

        if (!roles.length) {

            return interaction.reply({
                content:
                    "I couldn't find the selected roles.",
                flags: 64
            });

        }

        const rows = [];

        for (
            const role of roles
        ) {

            rows.push(
                new ActionRowBuilder()
                    .addComponents(

                        new ButtonBuilder()
                            .setCustomId(
                                `roleAdd:${name}:${role.id}`
                            )
                            .setLabel(
                                `Add ${role.name}`.slice(
                                    0,
                                    80
                                )
                            )
                            .setStyle(
                                ButtonStyle.Secondary
                            ),

                        new ButtonBuilder()
                            .setCustomId(
                                `roleEdit:${role.id}`
                            )
                            .setLabel(
                                "Edit"
                            )
                            .setStyle(
                                ButtonStyle.Secondary
                            ),

                        new ButtonBuilder()
                            .setCustomId(
                                `roleRemove:${name}:${role.id}`
                            )
                            .setLabel(
                                "Remove"
                            )
                            .setStyle(
                                ButtonStyle.Danger
                            ),

                        new ButtonBuilder()
                            .setCustomId(
                                `roleMove:${role.id}`
                            )
                            .setLabel(
                                "Move"
                            )
                            .setStyle(
                                ButtonStyle.Secondary
                            ),

                        new ButtonBuilder()
                            .setCustomId(
                                `roleSave:${name}:${role.id}`
                            )
                            .setLabel(
                                "Save"
                            )
                            .setStyle(
                                ButtonStyle.Success
                            )

                    )
            );

        }

        return interaction.reply({

            content:
                roles
                    .map(
                        role =>
                            `**${role.name}**\nRole ID: \`${role.id}\``
                    )
                    .join("\n\n"),

            components:
                rows.slice(0, 5),

            flags: 64

        });

    }

};
