const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const Embed =
    require("../../models/Embed");

module.exports = {

    name: "roleIdModal",

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

        const roleId =
            interaction.fields
                .getTextInputValue(
                    "roleId"
                )
                .trim();

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
                    "That role cannot be managed by a role selector.",
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

        let selectorName =
            null;

        let placeholder =
            null;

        try {

            selectorName =
                interaction.fields
                    .getTextInputValue(
                        "selectorName"
                    )
                    .trim();

        } catch {
            // Optional for Add Another Role.
        }

        try {

            placeholder =
                interaction.fields
                    .getTextInputValue(
                        "placeholder"
                    )
                    .trim();

        } catch {
            // Optional for Add Another Role.
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

        if (selector) {

            if (selectorName) {

                selector.selectorName =
                    selectorName;

            }

            if (placeholder) {

                selector.placeholder =
                    placeholder;

            }

        }

        saved.components =
            components;

        saved.markModified(
            "components"
        );

        await saved.save();

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
                            `roleSave:${name}:${role.id}`
                        )
                        .setLabel(
                            "Save"
                        )
                        .setStyle(
                            ButtonStyle.Success
                        )

                );

        const add =
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
                `Role: **${role.name}**\nRole ID: \`${role.id}\``,

            components: [
                buttons,
                add
            ],

            flags: 64

        });

    }

};
