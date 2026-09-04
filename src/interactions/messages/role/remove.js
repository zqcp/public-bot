const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const Embed =
    require("../../../models/Embed");


module.exports = {

    name: "roleRemove",

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
         * FIND ROLE OPTION
         */

        if (
            !Array.isArray(
                selector.options
            )
        ) {

            selector.options = [];

        }

        const index =
            selector.options.findIndex(
                option =>
                    option?.value ===
                    roleId
            );

        if (index === -1) {

            return interaction.reply({
                content:
                    "That role is not currently in the selector.",
                flags: 64
            });

        }


        /*
         * REMOVE ROLE
         */

        const removed =
            selector.options[index];

        selector.options.splice(
            index,
            1
        );


        /*
         * A SELECT MENU CANNOT HAVE
         * min/max VALUES ABOVE ITS
         * CURRENT OPTION COUNT.
         */

        if (
            selector.options.length
        ) {

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

        } else {

            selector.min_values = 1;
            selector.max_values = 1;

        }


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
                            `roleAdd:${name}:${roleId}`
                        )
                        .setLabel(
                            "Add"
                        )
                        .setStyle(
                            ButtonStyle.Secondary
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            `roleEdit:${roleId}`
                        )
                        .setLabel(
                            "Edit"
                        )
                        .setStyle(
                            ButtonStyle.Secondary
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            `roleRemove:${name}:${roleId}`
                        )
                        .setLabel(
                            "Remove"
                        )
                        .setStyle(
                            ButtonStyle.Secondary
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            `roleMove:${name}:${roleId}`
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


        /*
         * RESPONSE
         */

        return interaction.reply({

            content:
                `**${selector.selectorName || name}**\n` +
                `Removed role: **${removed.label}**\n` +
                `Options: **${selector.options.length}/25**`,

            components: [
                buttons,
                addAnother
            ],

            flags: 64

        });

    }

};
