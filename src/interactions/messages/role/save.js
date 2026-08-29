const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = {

    name: "roleSave",

    type: "button",

    async execute(client, interaction) {

        if (!interaction.guild) return;

        const roleId =
            interaction.customId.split(":")[1];

        const role =
            interaction.guild.roles.cache.get(
                roleId
            );

        if (!role) {
            return interaction.reply({
                content: "That role no longer exists.",
                flags: 64
            });
        }

        try {

            await interaction.message.edit({
                content:
                    `**${role.name}**\nRole ID: ${role.id}`,
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(
                                    `roleAdd:${role.id}`
                                )
                                .setLabel("Add")
                                .setStyle(ButtonStyle.Success),

                            new ButtonBuilder()
                                .setCustomId(
                                    `roleRemove:${role.id}`
                                )
                                .setLabel("Remove")
                                .setStyle(ButtonStyle.Danger),

                            new ButtonBuilder()
                                .setCustomId(
                                    `roleEdit:${role.id}`
                                )
                                .setLabel("Edit")
                                .setStyle(ButtonStyle.Secondary),

                            new ButtonBuilder()
                                .setCustomId(
                                    `roleMove:${role.id}`
                                )
                                .setLabel("Move")
                                .setStyle(ButtonStyle.Secondary)
                        )
                ]
            });

            return interaction.reply({
                content: `Saved **${role.name}**.`,
                flags: 64
            });

        } catch (error) {

            console.error(
                "[ROLE SAVE]",
                error
            );

            return interaction.reply({
                content: "I couldn't save the role.",
                flags: 64
            });

        }

    }

};
