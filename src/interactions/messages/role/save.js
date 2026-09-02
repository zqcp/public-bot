const {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} = require("discord.js");

const Embed =
    require("../../../models/Embed");

module.exports = {

    name: "roleSave",

    type: "button",

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
                    "Invalid role configuration.",
                flags: 64
            });

        }

        try {

            const saved =
                await Embed.findOne({
                    guildId:
                        interaction.guild.id,

                    name
                });

            if (!saved) {

                return interaction.reply({
                    content:
                        `I couldn't find the embed **${name}**.`,
                    flags: 64
                });

            }

            if (
                !Array.isArray(
                    saved.components
                )
            ) {

                saved.components = [];

            }

            const selectorRow =
                saved.components.find(
                    component =>
                        component?.type === 1 &&
                        Array.isArray(
                            component.components
                        ) &&
                        component.components.some(
                            item =>
                                item?.type === 3 &&
                                item.custom_id ===
                                    `roleSelect:${name}`
                        )
                );

            if (!selectorRow) {

                return interaction.reply({
                    content:
                        "No role selector has been configured yet.",
                    flags: 64
                });

            }

            const selector =
                selectorRow.components.find(
                    item =>
                        item?.type === 3 &&
                        item.custom_id ===
                            `roleSelect:${name}`
                );

            if (
                !selector ||
                !Array.isArray(
                    selector.options
                ) ||
                !selector.options.length
            ) {

                return interaction.reply({
                    content:
                        "No roles have been added to the selector.",
                    flags: 64
                });

            }

            const validOptions =
                selector.options
                    .map(
                        option => {

                            const role =
                                interaction.guild.roles.cache.get(
                                    option?.value
                                );

                            if (
                                !role ||
                                role.managed
                            ) {
                                return null;
                            }

                            return {

                                label:
                                    role.name.slice(
                                        0,
                                        100
                                    ),

                                description:
                                    `Role ID: ${role.id}`,

                                value:
                                    role.id

                            };

                        }
                    )
                    .filter(Boolean)
                    .slice(0, 25);

            if (!validOptions.length) {

                return interaction.reply({
                    content:
                        "None of the configured roles are still available.",
                    flags: 64
                });

            }

            selector.options =
                validOptions;

            selector.placeholder =
                "Select your roles...";

            selector.min_values =
                1;

            selector.max_values =
                validOptions.length;

            saved.markModified(
                "components"
            );

            await saved.save();

            const menu =
                new StringSelectMenuBuilder()
                    .setCustomId(
                        `roleSelect:${name}`
                    )
                    .setPlaceholder(
                        "Select your roles..."
                    )
                    .setMinValues(
                        1
                    )
                    .setMaxValues(
                        validOptions.length
                    )
                    .addOptions(
                        validOptions.map(
                            option =>
                                new StringSelectMenuOptionBuilder()
                                    .setLabel(
                                        option.label
                                    )
                                    .setDescription(
                                        option.description
                                    )
                                    .setValue(
                                        option.value
                                    )
                        )
                    );

            const row =
                new ActionRowBuilder()
                    .addComponents(
                        menu
                    );

            await interaction.message.edit({

                components: [
                    row
                ]

            });

            return interaction.reply({

                content:
                    `Role selector for **${name}** has been saved.`,

                flags: 64

            });

        } catch (error) {

            console.error(
                "[ROLE SAVE]",
                error
            );

            return interaction.reply({

                content:
                    "I couldn't save the role selector.",

                flags: 64

            });

        }

    }

};
