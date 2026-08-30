const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

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

        const roleId =
            interaction.fields
                .getTextInputValue("roleId")
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
                    "That role cannot be managed.",
                flags: 64
            });
        }

        const buttons =
            new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()
                        .setCustomId(
                            `roleAdd:${role.id}`
                        )
                        .setLabel("Add")
                        .setStyle(
                            ButtonStyle.Secondary
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            `roleEdit:${role.id}`
                        )
                        .setLabel("Edit")
                        .setStyle(
                            ButtonStyle.Secondary
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            `roleRemove:${role.id}`
                        )
                        .setLabel("Remove")
                        .setStyle(
                            ButtonStyle.Secondary
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            `roleMove:${role.id}`
                        )
                        .setLabel("Move")
                        .setStyle(
                            ButtonStyle.Secondary
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            `roleSave:${role.id}`
                        )
                        .setLabel("Save")
                        .setStyle(
                            ButtonStyle.Success
                        )

                );

        const add =
            new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()
                        .setCustomId(
                            "roleAddAnother"
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
