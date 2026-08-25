const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");

module.exports = {

    name: "embedFieldRemoveSelect",

    type: "select",

    async execute(client, interaction) {

        if (!interaction.guild) {
            return;
        }

        const [, name] =
            interaction.customId.split(":");

        const fieldIndex =
            Number(interaction.values[0]);

        if (
            !name ||
            Number.isNaN(fieldIndex)
        ) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "I couldn't determine which field you selected."
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

        const fields =
            Array.isArray(saved.embeds?.[0]?.fields)
                ? saved.embeds[0].fields
                : [];

        const field =
            fields[fieldIndex];

        if (!field) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "I couldn't find that field."
                    )
                ],
                flags: 64
            });
        }

        const row =
            new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()
                        .setCustomId(
                            `embedFieldRemoveConfirm:${name}:${fieldIndex}`
                        )
                        .setLabel("Remove")
                        .setStyle(
                            ButtonStyle.Danger
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            `embedFields:${name}:back`
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
                    `Are you sure you want to remove field **${fieldIndex + 1} — ${field.name}** from **${name}**?`
                )
            ],
            components: [
                row
            ]
        });

    }

};
