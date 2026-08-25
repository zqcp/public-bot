const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");
const editor = require("../../systems/messages/editor");

module.exports = {

    name: "embedSelectMenuRemoveConfirm",

    type: "button",

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

        const rowIndex =
            Number(parts[3]);

        const componentIndex =
            Number(parts[4]);

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
                        "I couldn't determine which select menu you're removing."
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

        const component =
            saved.components?.[rowIndex]
                ?.components?.[componentIndex];

        if (!component) {
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

        const label =
            component.placeholder ||
            component.custom_id ||
            `${type} select menu`;

        const row =
            new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()
                        .setCustomId(
                            `embedSelectMenuRemoveConfirmYes:${name}:${type}:${rowIndex}:${componentIndex}`
                        )
                        .setLabel("Remove")
                        .setStyle(
                            ButtonStyle.Danger
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            `embedSelectMenuRemoveConfirmNo:${name}:${type}`
                        )
                        .setLabel("Cancel")
                        .setStyle(
                            ButtonStyle.Secondary
                        )

                );

        return interaction.reply({
            embeds: [
                embeds.error(
                    interaction.user,
                    `Are you sure you want to remove **${label}** from **${name}**?`
                )
            ],
            components: [
                row
            ],
            flags: 64
        });

    }

};
