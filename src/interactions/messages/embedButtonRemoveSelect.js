const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");

module.exports = {

    name: "embedButtonRemoveSelect",

    type: "select",

    async execute(client, interaction) {

        if (!interaction.guild) {
            return;
        }

        const [, name] =
            interaction.customId.split(":");

        const value =
            interaction.values[0];

        const [rowIndex, buttonIndex] =
            value.split(":").map(Number);

        if (
            !name ||
            Number.isNaN(rowIndex) ||
            Number.isNaN(buttonIndex)
        ) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "I couldn't determine which button you selected."
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

        const button =
            saved.components?.[rowIndex]
                ?.components?.[buttonIndex];

        if (
            !button ||
            button.type !== 2
        ) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "I couldn't find that button."
                    )
                ],
                flags: 64
            });
        }

        const label =
            button.label ||
            button.custom_id ||
            button.url ||
            `Button ${buttonIndex + 1}`;

        const row =
            new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()
                        .setCustomId(
                            `embedButtonRemoveConfirm:${name}:${rowIndex}:${buttonIndex}`
                        )
                        .setLabel("Remove")
                        .setStyle(
                            ButtonStyle.Danger
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            `embedButtons:${name}:back`
                        )
                        .setLabel("Cancel")
                        .setStyle(
                            ButtonStyle.Secondary
                        )

                );

        return interaction.update({
            embeds: [
                embeds.regular(
                    interaction.user,
                    `Are you sure you want to remove button **${label}** from **${name}**?`
                )
            ],
            components: [
                row
            ]
        });

    }

};
