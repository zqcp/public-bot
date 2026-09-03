const {
    StringSelectMenuBuilder,
    ActionRowBuilder
} = require("discord.js");

const Embed =
    require("../../models/Embed");


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
                    "I couldn't determine which embed you're editing.",
                flags: 64
            });

        }

        const saved =
            await Embed.findOne({
                guildId:
                    interaction.guild.id,

                name
            });

        if (!saved) {

            return interaction.reply({
                content:
                    "I couldn't find that embed.",
                flags: 64
            });

        }

        const components =
            Array.isArray(saved.components)
                ? saved.components
                : [];

        const selector =
            components.find(
                component =>
                    component?.type === 3 &&
                    component.custom_id ===
                        `roleSelect:${name}`
            );

        if (!selector) {

            return interaction.reply({
                content:
                    "There is no role selector configured for this embed.",
                flags: 64
            });

        }

        if (
            !Array.isArray(
                selector.options
            ) ||
            !selector.options.length
        ) {

            return interaction.reply({
                content:
                    "Add at least one role before saving the selector.",
                flags: 64
            });

        }

        selector.options =
            selector.options
                .filter(
                    option => {

                        const role =
                            interaction.guild.roles.cache.get(
                                option.value
                            );

                        return (
                            role &&
                            !role.managed
                        );

                    }
                )
                .map(
                    option => {

                        const role =
                            interaction.guild.roles.cache.get(
                                option.value
                            );

                        return {

                            label:
                                role.name,

                            value:
                                role.id,

                            description:
                                `Role ID: ${role.id}`

                        };

                    }
                );

        if (
            !selector.options.length
        ) {

            return interaction.reply({
                content:
                    "None of the configured roles can be used by this selector.",
                flags: 64
            });

        }

        selector.max_values =
            Math.min(
                selector.max_values ||
                    selector.options.length,
                selector.options.length
            );

        selector.min_values =
            Math.min(
                selector.min_values || 1,
                selector.options.length
            );

        if (
            selector.max_values <
            selector.min_values
        ) {

            selector.max_values =
                selector.min_values;

        }

        selector.placeholder =
            selector.placeholder ||
            "Choose your roles...";

        selector.selectorName =
            selector.selectorName ||
            "Roles";

        saved.components =
            components;

        saved.markModified(
            "components"
        );

        await saved.save();

        const menu =
            new StringSelectMenuBuilder()
                .setCustomId(
                    selector.custom_id
                )
                .setPlaceholder(
                    selector.placeholder
                )
                .setMinValues(
                    selector.min_values
                )
                .setMaxValues(
                    selector.max_values
                )
                .addOptions(
                    selector.options
                );

        return interaction.update({

            content:
                `**${selector.selectorName}**`,

            components: [

                new ActionRowBuilder()
                    .addComponents(
                        menu
                    )

            ]

        });

    }

};
