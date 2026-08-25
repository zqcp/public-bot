const {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");

module.exports = {

    name: "embedButtonRemove",

    type: "button",

    async execute(client, interaction) {

        if (!interaction.guild) {
            return;
        }

        const [, name] =
            interaction.customId.split(":");

        if (!name) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "I couldn't determine which embed you're editing."
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

        const buttons = [];

        if (Array.isArray(saved.components)) {

            for (
                let rowIndex = 0;
                rowIndex < saved.components.length;
                rowIndex++
            ) {

                const row =
                    saved.components[rowIndex];

                if (
                    !Array.isArray(
                        row.components
                    )
                ) {
                    continue;
                }

                for (
                    let buttonIndex = 0;
                    buttonIndex < row.components.length;
                    buttonIndex++
                ) {

                    const button =
                        row.components[buttonIndex];

                    if (
                        button.type !== 2
                    ) {
                        continue;
                    }

                    buttons.push({
                        rowIndex,
                        buttonIndex,
                        button
                    });

                }

            }

        }

        if (!buttons.length) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        `Embed **${name}** doesn't have any buttons to remove.`
                    )
                ],
                flags: 64
            });
        }

        const menu =
            new StringSelectMenuBuilder()
                .setCustomId(
                    `embedButtonRemoveSelect:${name}`
                )
                .setPlaceholder(
                    "Select a button to remove..."
                )
                .addOptions(
                    buttons.map(
                        (
                            {
                                rowIndex,
                                buttonIndex,
                                button
                            },
                            index
                        ) => {

                            const label =
                                button.label ||
                                button.custom_id ||
                                button.url ||
                                `Button ${index + 1}`;

                            return {
                                label:
                                    label.length > 100
                                        ? label.slice(0, 97) + "..."
                                        : label,

                                description:
                                    `Row ${rowIndex + 1}, Button ${buttonIndex + 1}`,

                                value:
                                    `${rowIndex}:${buttonIndex}`
                            };

                        }
                    )
                );

        const row =
            new ActionRowBuilder()
                .addComponents(menu);

        const back =
            new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()
                        .setCustomId(
                            `embedButtons:${name}:back`
                        )
                        .setLabel("Back")
                        .setStyle(
                            ButtonStyle.Secondary
                        )

                );

        return interaction.reply({
            embeds: [
                embeds.regular(
                    interaction.user,
                    `Select the button you want to remove from **${name}**.`
                )
            ],
            components: [
                row,
                back
            ],
            flags: 64
        });

    }

};
