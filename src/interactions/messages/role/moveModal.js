const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const Embed =
    require("../../../models/Embed");


module.exports = {

    name: "roleMoveModal",

    type: "modal",

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
                    "I couldn't determine which role you're moving.",
                flags: 64
            });

        }


        /*
         * GET POSITION
         */

        const positionText =
            interaction.fields
                .getTextInputValue(
                    "position"
                )
                .trim();

        const position =
            Number(
                positionText
            );

        if (
            !Number.isInteger(position) ||
            position < 1
        ) {

            return interaction.reply({
                content:
                    "Please provide a valid option position.",
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
         * OPTIONS
         */

        if (
            !Array.isArray(
                selector.options
            ) ||
            !selector.options.length
        ) {

            return interaction.reply({
                content:
                    "There are no roles in this selector to move.",
                flags: 64
            });

        }


        /*
         * FIND ROLE
         */

        const currentIndex =
            selector.options.findIndex(
                option =>
                    option?.value ===
                    roleId
            );

        if (currentIndex === -1) {

            return interaction.reply({
                content:
                    "That role is not currently in the selector.",
                flags: 64
            });

        }


        /*
         * POSITIONS ARE 1-BASED
         */

        if (
            position >
            selector.options.length
        ) {

            return interaction.reply({
                content:
                    `Position must be between **1** and **${selector.options.length}**.`,
                flags: 64
            });

        }


        const newIndex =
            position - 1;


        /*
         * NOTHING TO MOVE
         */

        if (
            currentIndex ===
            newIndex
        ) {

            return interaction.reply({
                content:
                    `**${selector.options[currentIndex].label}** is already at position **${position}**.`,
                flags: 64
            });

        }


        /*
         * MOVE OPTION
         */

        const moved =
            selector.options.splice(
                currentIndex,
                1
            )[0];

        selector.options.splice(
            newIndex,
            0,
            moved
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


        return interaction.reply({

            content:
                `**${selector.selectorName || name}**\n` +
                `Moved **${moved.label}** to position **${position}**.\n` +
                `Options: **${selector.options.length}/25**`,

            components: [
                buttons,
                addAnother
            ],

            flags: 64

        });

    }

};
