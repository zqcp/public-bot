const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = {

    name: "roleSelect",

    type: "selectMenu",

    async execute(
        client,
        interaction
    ) {

        if (!interaction.guild) {
            return;
        }

        const roleId =
            interaction.values[0];

        const role =
            interaction.guild.roles.cache.get(
                roleId
            );

        if (!role) {
            return interaction.reply({
                content:
                    "That role no longer exists.",
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

        return interaction.reply({

            content:
                `Selected **${role.name}**\nRole ID: \`${role.id}\``,

            components: [
                buttons
            ],

            flags: 64

        });

    }

};
