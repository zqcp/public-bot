const {
    EmbedBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require("discord.js");

const config = require("../../config");


// =========================
// TEMP ROLE CONFIG
// =========================
//
// Stores:
//
// {
//     name: "Member",
//     roleId: "actual Discord role ID"
// }
//
// Multiple roles are supported.
//

const roleData = new Map();


function getRoles(userId) {

    if (!roleData.has(userId)) {
        roleData.set(userId, []);
    }

    return roleData.get(userId);
}


module.exports = {

    type: "select",

    name: "embed_roles",

    async execute(interaction) {

        const parts =
            interaction.customId.split(":");

        const creatorId =
            parts[1];


        // =========================
        // OWNER CHECK
        // =========================

        if (
            creatorId &&
            interaction.user.id !== creatorId
        ) {

            const embed =
                new EmbedBuilder()
                    .setColor(
                        config.colors.failed
                    )
                    .setDescription(
                        `${config.emojis.failed} ${interaction.client.user}: You can't use this embed because you didn't create it.`
                    );

            return interaction.reply({

                embeds: [
                    embed
                ],

                flags: 64

            });
        }


        // =========================
        // SERVER CHECK
        // =========================

        if (!interaction.guild) {

            const embed =
                new EmbedBuilder()
                    .setColor(
                        config.colors.failed
                    )
                    .setDescription(
                        `${config.emojis.failed} ${interaction.client.user}: This interaction can only be used in a server.`
                    );

            return interaction.reply({

                embeds: [
                    embed
                ],

                flags: 64

            });
        }


        // =========================
        // ROLE SELECTED
        // =========================

        if (
            interaction.customId.startsWith(
                "embed_role_select:"
            )
        ) {

            if (
                !interaction.values ||
                !interaction.values.length
            ) {

                const embed =
                    new EmbedBuilder()
                        .setColor(
                            config.colors.failed
                        )
                        .setDescription(
                            `${config.emojis.failed} ${interaction.client.user}: You didn't select a role.`
                        );

                return interaction.reply({

                    embeds: [
                        embed
                    ],

                    flags: 64

                });
            }


            // =========================
            // GET SELECTED ROLE
            // =========================

            const roleId =
                interaction.values[0];

            const role =
                interaction.guild.roles.cache.get(
                    roleId
                );


            if (!role) {

                const embed =
                    new EmbedBuilder()
                        .setColor(
                            config.colors.failed
                        )
                        .setDescription(
                            `${config.emojis.failed} ${interaction.client.user}: That role could not be found.`
                        );

                return interaction.reply({

                    embeds: [
                        embed
                    ],

                    flags: 64

                });
            }


            // =========================
            // CHECK DUPLICATE
            // =========================

            const savedRoles =
                getRoles(creatorId);

            const exists =
                savedRoles.some(
                    item =>
                        item.roleId === role.id
                );


            if (exists) {

                const embed =
                    new EmbedBuilder()
                        .setColor(
                            config.colors.failed
                        )
                        .setDescription(
                            `${config.emojis.failed} ${interaction.client.user}: That role has already been added.`
                        );

                return interaction.reply({

                    embeds: [
                        embed
                    ],

                    flags: 64

                });
            }


            // =========================
            // NAME MODAL
            // =========================

            const modal =
                new ModalBuilder()
                    .setCustomId(
                        `embed_role_name:${creatorId}:${role.id}`
                    )
                    .setTitle(
                        "Role Name"
                    );


            const nameInput =
                new TextInputBuilder()
                    .setCustomId(
                        "role_name"
                    )
                    .setLabel(
                        "Custom Name"
                    )
                    .setPlaceholder(
                        "Example: Member"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(
                        true
                    )
                    .setMaxLength(
                        100
                    );


            const row =
                new ActionRowBuilder()
                    .addComponents(
                        nameInput
                    );


            modal.addComponents(
                row
            );


            return interaction.showModal(
                modal
            );
        }


        // =========================
        // GET EXISTING ROLES
        // =========================

        const savedRoles =
            getRoles(creatorId);


        // =========================
        // ROLE OPTIONS
        // =========================

        const options =
            interaction.guild.roles.cache
                .filter(
                    role =>
                        !role.managed
                )
                .first(25)
                .map(
                    role => {

                        return new StringSelectMenuOptionBuilder()

                            .setLabel(
                                role.name.slice(
                                    0,
                                    100
                                )
                            )

                            .setValue(
                                role.id
                            )

                            .setDescription(
                                `Add ${role.name}`
                                    .slice(
                                        0,
                                        100
                                    )
                            );

                    }
                );


        // =========================
        // NO ROLES
        // =========================

        if (!options.length) {

            const embed =
                new EmbedBuilder()
                    .setColor(
                        config.colors.failed
                    )
                    .setDescription(
                        `${config.emojis.failed} ${interaction.client.user}: There are no selectable roles.`
                    );

            return interaction.reply({

                embeds: [
                    embed
                ],

                flags: 64

            });
        }


        // =========================
        // ROLE SELECT MENU
        // =========================

        const menu =
            new StringSelectMenuBuilder()
                .setCustomId(
                    `embed_role_select:${creatorId}`
                )
                .setPlaceholder(
                    "Select a role"
                )
                .setMinValues(
                    1
                )
                .setMaxValues(
                    1
                )
                .addOptions(
                    options
                );


        const menuRow =
            new ActionRowBuilder()
                .addComponents(
                    menu
                );


        // =========================
        // CURRENT ROLES
        // =========================

        let currentRoles =
            "No roles added yet.";


        if (savedRoles.length) {

            currentRoles =
                savedRoles
                    .map(
                        item => {

                            const role =
                                interaction.guild.roles.cache.get(
                                    item.roleId
                                );

                            return (
                                `**Name:** ${item.name}\n` +
                                `**Role:** ${role || "Unknown"}`
                            );

                        }
                    )
                    .join("\n\n");

        }


        // =========================
        // EMBED
        // =========================

        const embed =
            new EmbedBuilder()
                .setColor(
                    config.colors.regular
                )
                .setDescription(
                    `${config.emojis.add} ${interaction.client.user}: **Roles**\n\n` +
                    `${currentRoles}\n\n` +
                    `Select a role below and give it a custom name.`
                );


        // =========================
        // SAVE BUTTON
        // =========================

        const saveButton =
            new ButtonBuilder()
                .setCustomId(
                    `embed_role_save:${creatorId}`
                )
                .setLabel(
                    "Save"
                )
                .setStyle(
                    ButtonStyle.Success
                );


        const buttonRow =
            new ActionRowBuilder()
                .addComponents(
                    saveButton
                );


        // =========================
        // UPDATE
        // =========================

        return interaction.update({

            embeds: [
                embed
            ],

            components: [
                menuRow,
                buttonRow
            ]

        });

    },


    roleData

};
