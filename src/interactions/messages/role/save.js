const {
    ActionRowBuilder,
    StringSelectMenuBuilder
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
                    "I couldn't determine which embed you're editing.",
                flags: 64
            });

        }


        /*
         * LOAD EMBED
         */

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


        /*
         * FIND ROLE SELECT
         *
         * Action Row
         * └── String Select
         */

        const components =
            Array.isArray(
                saved.components
            )
                ? saved.components
                : [];

        const row =
            components.find(
                component =>
                    component?.type === 1 &&
                    Array.isArray(
                        component.components
                    ) &&
                    component.components.some(
                        select =>
                            select?.type === 3 &&
                            select.custom_id ===
                                `roleSelect:${name}`
                    )
            );

        if (!row) {

            return interaction.reply({
                content:
                    "I couldn't find the role selector.",
                flags: 64
            });

        }


        const selector =
            row.components.find(
                component =>
                    component?.type === 3 &&
                    component.custom_id ===
                        `roleSelect:${name}`
            );

        if (!selector) {

            return interaction.reply({
                content:
                    "I couldn't find the role selector.",
                flags: 64
            });

        }


        /*
         * VALIDATE OPTIONS
         */

        if (
            !Array.isArray(
                selector.options
            ) ||
            !selector.options.length
        ) {

            return interaction.reply({
                content:
                    "You need to add at least one role before saving the selector.",
                flags: 64
            });

        }


        /*
         * DISCORD STRING SELECT LIMIT
         */

        if (
            selector.options.length >
            25
        ) {

            return interaction.reply({
                content:
                    "This selector cannot contain more than **25 roles**.",
                flags: 64
            });

        }


        /*
         * BUILD SELECT MENU
         */

        const menu =
            new StringSelectMenuBuilder()
                .setCustomId(
                    selector.custom_id
                )
                .setPlaceholder(
                    selector.placeholder ||
                    "Choose your roles..."
                )
                .setMinValues(
                    Math.max(
                        1,
                        Math.min(
                            Number(
                                selector.min_values
                            ) || 1,
                            selector.options.length
                        )
                    )
                )
                .setMaxValues(
                    Math.max(
                        1,
                        Math.min(
                            Number(
                                selector.max_values
                            ) || 1,
                            selector.options.length
                        )
                    )
                )
                .addOptions(
                    selector.options.map(
                        option => ({

                            label:
                                option.label,

                            value:
                                option.value,

                            ...(option.description
                                ? {
                                    description:
                                        option.description
                                }
                                : {})

                        })
                    )
                );


        /*
         * RETURN THE SAVED SELECTOR
         */

        return interaction.update({

            content:
                `**${selector.selectorName || name}**\n` +
                `Role selector saved successfully.\n` +
                `Placeholder: \`${selector.placeholder || "Choose your roles..."}\`\n` +
                `Options: **${selector.options.length}/25**`,

            components: [

                new ActionRowBuilder()
                    .addComponents(
                        menu
                    )

            ]

        });

    }

};
