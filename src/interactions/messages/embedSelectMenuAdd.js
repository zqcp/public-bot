const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");

module.exports = {

    name: "embedSelectMenuAdd",

    type: "button",

    async execute(client, interaction) {

        if (!interaction.guild) {
            return;
        }

        const parts =
            interaction.customId.split(":");

        const name = parts[1];
        const type = parts[2];

        if (!name || !type) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "I couldn't determine which select menu you're adding."
                    )
                ],
                flags: 64
            });
        }

        const saved =
            await Embed.findOne({
                guildId: interaction.guild.id,
                name
            });

        if (!saved) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        `I couldn't find an embed named **${name}**.`
                    )
                ],
                flags: 64
            });
        }

        const types = {
            role: "Role Select",
            user: "User Select",
            channel: "Channel Select",
            mentionable: "Mentionable Select"
        };

        if (!types[type]) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "That select menu type isn't supported."
                    )
                ],
                flags: 64
            });
        }

        const modal =
            new ModalBuilder()
                .setCustomId(
                    `embedSelectMenuAddModal:${name}:${type}`
                )
                .setTitle(
                    `Add ${types[type]}`
                );

        const placeholder =
            new TextInputBuilder()
                .setCustomId("placeholder")
                .setLabel("Placeholder")
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(false)
                .setPlaceholder(
                    type === "role"
                        ? "Select your role..."
                        : "Select something..."
                )
                .setValue(
                    type === "role"
                        ? "Select your role..."
                        : "Select something..."
                );

        const disabled =
            new TextInputBuilder()
                .setCustomId("disabled")
                .setLabel("Disabled")
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(false)
                .setPlaceholder(
                    "true or false"
                )
                .setValue("false");

        if (type === "role") {

            const roleName =
                new TextInputBuilder()
                    .setCustomId("roleName")
                    .setLabel("Role Name")
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true)
                    .setPlaceholder("Male");

            const roleId =
                new TextInputBuilder()
                    .setCustomId("roleId")
                    .setLabel("Role ID")
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true)
                    .setPlaceholder(
                        "Enter the role ID"
                    );

            modal.addComponents(

                new ActionRowBuilder()
                    .addComponents(
                        placeholder
                    ),

                new ActionRowBuilder()
                    .addComponents(
                        roleName
                    ),

                new ActionRowBuilder()
                    .addComponents(
                        roleId
                    ),

                new ActionRowBuilder()
                    .addComponents(
                        disabled
                    )

            );

            return interaction.showModal(
                modal
            );
        }

        const customId =
            new TextInputBuilder()
                .setCustomId("customId")
                .setLabel("Custom ID")
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(true)
                .setPlaceholder(
                    "my-select-menu"
                );

        modal.addComponents(

            new ActionRowBuilder()
                .addComponents(
                    placeholder
                ),

            new ActionRowBuilder()
                .addComponents(
                    customId
                ),

            new ActionRowBuilder()
                .addComponents(
                    disabled
                )

        );

        return interaction.showModal(
            modal
        );

    }

};
