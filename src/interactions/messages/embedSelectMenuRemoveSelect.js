const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");

module.exports = {

    name: "embedSelectMenuRemoveSelect",

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

        const label =
            menu.placeholder ||
            menu.custom_id ||
            `${type} select menu`;

        return interaction.reply({
            embeds: [
                embeds.error(
                    interaction.user,
                    `Are you sure you want to remove **${label}** from **${name}**?`
                )
            ],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            custom_id:
                                `embedSelectMenuRemoveConfirmYes:${name}:${type}:${rowIndex}:${componentIndex}`,
                            label: "Remove",
                            style: 4
                        },
                        {
                            type: 2,
                            custom_id:
                                `embedSelectMenuRemoveConfirmNo:${name}:${type}`,
                            label: "Cancel",
                            style: 2
                        }
                    ]
                }
            ],
            flags: 64
        });

    }

};
