const {
    StringSelectMenuBuilder
} = require("discord.js");

const Embed =
    require("../../models/Embed");


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

        if (
            !name ||
            !roleId
        ) {

            return interaction.reply({
                content:
                    "Invalid role configuration.",
                flags: 64
            });

        }

        const role =
            interaction.guild.roles.cache.get(
                roleId
            );

        if (!role) {

            return interaction.reply({
                content:
                    "I couldn't find that role.",
                flags: 64
            });

        }

        if (role.managed) {

            return interaction.reply({
                content:
                    "That role cannot be added to a role selector.",
                flags: 64
            });

        }

        const botMember =
            interaction.guild.members.me;

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

        let selector =
            components.find(
                component =>
                    component?.type === 3 &&
                    component.custom_id ===
                        `roleSelect:${name}`
            );

        if (!selector) {

            selector = {

                type: 3,

                custom_id:
                    `roleSelect:${name}`,

                selectorName:
                    "Roles",

                placeholder:
                    "Choose your roles...",

                min_values:
                    1,

                max_values:
                    1,

                options: []

            };

            components.push(
                selector
            );

        }

        if (
            !Array.isArray(
                selector.options
            )
        ) {

            selector.options = [];

        }

        const exists =
            selector.options.some(
                option =>
                    option.value ===
                    role.id
            );

        if (exists) {

            return interaction.reply({
                content:
                    `**${role.name}** is already in this role selector.`,
                flags: 64
            });

        }

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

        selector.max_values =
            selector.options.length;

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
                    selector.placeholder ||
                    "Choose your roles..."
                )
                .setMinValues(
                    selector.min_values || 1
                )
                .setMaxValues(
                    Math.min(
                        selector.max_values ||
                        1,
                        selector.options.length
                    )
                )
                .addOptions(
                    selector.options
                );

        return interaction.reply({

            content:
                `Added **${role.name}** to **${selector.selectorName || "Roles"}**.`,

            components: [

                {
                    type: 1,
                    components: [
                        menu
                    ]
                }

            ],

            flags: 64

        });

    }

};
