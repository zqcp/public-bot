const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const Embed =
    require("../../../models/Embed");


module.exports = {

    name: "roleSetupModal",

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

        if (!name) {

            return interaction.reply({
                content:
                    "I couldn't determine which embed you're editing.",
                flags: 64
            });

        }

        let roleId =
            interaction.fields
                .getTextInputValue(
                    "roleId"
                )
                .trim();


        /*
         * Normalize role input.
         *
         * Accept:
         *
         * 123456789012345678
         *
         * <@&123456789012345678>
         */

        const mentionMatch =
            roleId.match(
                /^<@&(\d+)>$/
            );

        if (mentionMatch) {

            roleId =
                mentionMatch[1];

        }


        /*
         * Make sure the value is a
         * Discord snowflake.
         */

        if (
            !/^\d+$/.test(
                roleId
            )
        ) {

            return interaction.reply({
                content:
                    "Please provide a valid **Role ID** or role mention.",
                flags: 64
            });

        }


        const selectorName =
            interaction.fields
                .getTextInputValue(
                    "selectorName"
                )
                .trim();

        const placeholder =
            interaction.fields
                .getTextInputValue(
                    "placeholder"
                )
                .trim();


        /*
         * FETCH ROLE DIRECTLY
         *
         * Do not rely on the role cache.
         */

        const role =
            await interaction.guild.roles
                .fetch(
                    roleId
                )
                .catch(
                    () => null
                );


        if (!role) {

            return interaction.reply({
                content:
                    `I couldn't find the role with ID \`${roleId}\` in this server.`,
                flags: 64
            });

        }


        /*
         * MANAGED ROLE
         */

        if (role.managed) {

            return interaction.reply({
                content:
                    "That role cannot be managed by a role selector.",
                flags: 64
            });

        }


        /*
         * BOT ROLE HIERARCHY
         */

        const botMember =
            interaction.guild.members.me ||
            await interaction.guild.members
                .fetch(
                    interaction.client.user.id
                )
                .catch(
                    () => null
                );

        if (!botMember) {

            return interaction.reply({
                content:
                    "I couldn't determine my server member.",
                flags: 64
            });

        }


        if (
            role.position >=
            botMember.roles.highest.position
        ) {

            return interaction.reply({
                content:
                    "I cannot manage that role because it is higher than or equal to my highest role.",
                flags: 64
            });

        }


        /*
         * SELECTOR SETTINGS
         */

        if (!selectorName) {

            return interaction.reply({
                content:
                    "Please provide a selector name.",
                flags: 64
            });

        }

        if (!placeholder) {

            return interaction.reply({
                content:
                    "Please provide a selector placeholder.",
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
         * COMPONENTS
         */

        const components =
            Array.isArray(
                saved.components
            )
                ? saved.components
                : [];


        /*
         * FIND EXISTING ROLE SELECT
         */

        let row =
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


        /*
         * CREATE SELECTOR
         */

        if (!row) {

            row = {

                type: 1,

                components: [

                    {
                        type: 3,

                        custom_id:
                            `roleSelect:${name}`,

                        selectorName,

                        placeholder,

                        min_values: 1,

                        max_values: 1,

                        options: []

                    }

                ]

            };

            components.push(
                row
            );

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
                    "I couldn't prepare the role selector.",
                flags: 64
            });

        }


        /*
         * UPDATE SELECTOR
         */

        selector.selectorName =
            selectorName;

        selector.placeholder =
            placeholder;


        if (
            !Array.isArray(
                selector.options
            )
        ) {

            selector.options = [];

        }


        /*
         * CHECK DUPLICATE
         */

        const exists =
            selector.options.some(
                option =>
                    option?.value ===
                    role.id
            );


        if (!exists) {

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

            selector.options.push({

                label:
                    role.name,

                value:
                    role.id,

                description:
                    `Role ID: ${role.id}`

            });

        }


        /*
         * KEEP SELECT VALUES VALID
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
                `**${selector.selectorName}**\n` +
                `Role: **${role.name}**\n` +
                `Role ID: \`${role.id}\`\n` +
                `Placeholder: \`${selector.placeholder}\``,

            components: [
                buttons,
                addAnother
            ],

            flags: 64

        });

    }

};
