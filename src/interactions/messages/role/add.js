const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const Embed =
    require("../../../models/Embed");


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

        const parts =
            interaction.customId.split(":");

        const name =
            parts[1];

        const roleId =
            parts[2];

        if (!name || !roleId) {

            return interaction.reply({
                content:
                    "I couldn't determine which role selector you're editing.",
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
         * FIND ROLE
         */

        const role =
            interaction.guild.roles.cache.get(
                roleId
            );

        if (!role) {

            return interaction.reply({
                content:
                    `I couldn't find the role with ID \`${roleId}\`.`,
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
         * OPTIONS
         */

        if (
            !Array.isArray(
                selector.options
            )
        ) {

            selector.options = [];

        }


        /*
         * DUPLICATE CHECK
         */

        const exists =
            selector.options.some(
                option =>
                    option?.value ===
                    role.id
            );

        if (exists) {

            return interaction.reply({
                content:
                    `The role **${role.name}** is already in this selector.`,
                flags: 64
            });

        }


        /*
         * DISCORD LIMIT
         */

        if (
            selector.options.length >=
            25
        ) {

            return interaction.reply({
                content:
                    "This selector has reached Discord's maximum of **25 options**.",
                flags: 64
            });

        }


        /*
         * ADD ROLE
         */

        selector.options.push({

            label:
                role.name,

            value:
                role.id,

            description:
                `Role ID: ${role.id}`

        });


        /*
         * KEEP VALUES VALID
         */

        selector.min_values =
            Math.max(
                1,
                Math.min(
                    Number(
                        selector.min_values
                    ) || 1,
                    selector.options.length
                )
            );

        selector.max_values =
            Math.max(
                selector.min_values,
                Math.min(
                    Number(
                        selector.max_values
                    ) || 1,
                    selector.options.length
                )
            );


        /*
         * SAVE
         */

        saved.components =
            components;

        saved.markModified(
            "components"
        );

        await saved.save();


        /*
         * EDITOR CONTROLS
         */

        const buttons =
            new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()
                        .setCustomId(
                            `roleAdd:${name}:${role.id}`
                        )
                        .setLabel(
                            "Add"
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
                            ButtonStyle.Secondary
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            `roleMove:${name}:${role.id}`
                        )
                        .setLabel(
                            "Move"
                        )
                        .setStyle(
                            ButtonStyle.Secondary
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            `roleSave:${name}`
                        )
                        .setLabel(
                            "Save"
                        )
                        .setStyle(
                            ButtonStyle.Success
                        )

                );


        const addAnother =
            new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()
                        .setCustomId(
                            `roleAddAnother:${name}`
                        )
                        .setLabel(
                            "Add another role"
                        )
                        .setStyle(
                            ButtonStyle.Secondary
                        )

                );


        return interaction.reply({

            content:
                `**${selector.selectorName || name}**\n` +
                `Added role: **${role.name}**\n` +
                `Role ID: \`${role.id}\`\n` +
                `Placeholder: \`${selector.placeholder || "Choose your roles..." }\`\n` +
                `Options: **${selector.options.length}/25**`,

            components: [
                buttons,
                addAnother
            ],

            flags: 64

        });

    }

};
