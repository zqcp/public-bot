const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");

module.exports = {

    name: "embedSelectMenuEditSelect",

    type: "select",

    async execute(client, interaction) {

        if (!interaction.guild) {
            return;
        }

        const parts =
            interaction.customId.split(":");

        const name =
            parts[1];

        const type =
            parts[2];

        const value =
            interaction.values[0];

        const [rowIndex, componentIndex] =
            value.split(":").map(Number);

        if (
            !name ||
            !type ||
            Number.isNaN(rowIndex) ||
            Number.isNaN(componentIndex)
        ) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "I couldn't determine which select menu you're editing."
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

        const menu =
            saved.components?.[rowIndex]
                ?.components?.[componentIndex];

        if (!menu) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "I couldn't find that select menu."
                    )
                ],
                flags: 64
            });
        }

        const placeholder =
            new TextInputBuilder()
                .setCustomId("placeholder")
                .setLabel("Placeholder")
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
                .setValue(
                    menu.placeholder ||
                    "Select something..."
                );

        const disabled =
            new TextInputBuilder()
                .setCustomId("disabled")
                .setLabel("Disabled")
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
                .setValue(
                    menu.disabled
                        ? "true"
                        : "false"
                );

        const modal =
            new ModalBuilder()
                .setCustomId(
                    `embedSelectMenuEditModal:${name}:${type}:${rowIndex}:${componentIndex}`
                )
                .setTitle(
                    `Edit ${type} Select`
                );

        /*
         * Role Select
         *
         * Role selects are stored as String Selects
         * (type 3) with role IDs inside option values.
         */
        if (type === "role") {

            const option =
                Array.isArray(menu.options) &&
                menu.options.length
                    ? menu.options[0]
                    : null;

            const roleId =
                option?.value || "";

            const role =
                interaction.guild.roles.cache.get(
                    String(roleId)
                );

            const roleName =
                new TextInputBuilder()
                    .setCustomId("roleName")
                    .setLabel("Role Name")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setValue(
                        option?.label ||
                        role?.name ||
                        ""
                    );

            const roleIdInput =
                new TextInputBuilder()
                    .setCustomId("roleId")
                    .setLabel("Role ID")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setValue(
                        roleId
                            ? String(roleId)
                            : ""
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
                        roleIdInput
                    ),

                new ActionRowBuilder()
                    .addComponents(
                        disabled
                    )

            );

        } else {

            const customId =
                new TextInputBuilder()
                    .setCustomId("customId")
                    .setLabel("Custom ID")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setValue(
                        menu.custom_id ||
                        ""
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
        }

        return interaction.showModal(modal);

    }

};
