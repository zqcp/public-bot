const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");
const editor = require("../../systems/messages/editor");

module.exports = {

    name: "embedSelectMenuRemoveConfirmYes",

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

        const row =
            saved.components?.[rowIndex];

        if (!row || !Array.isArray(row.components)) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "I couldn't find that select menu row."
                    )
                ],
                flags: 64
            });
        }

        if (!row.components[componentIndex]) {
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

        row.components.splice(
            componentIndex,
            1
        );

        if (row.components.length === 0) {
            saved.components.splice(
                rowIndex,
                1
            );
        }

        saved.markModified("components");

        await saved.save();

        await editor.updateMessage(
            client,
            interaction.guild.id,
            name
        );

        return interaction.update({
            embeds: [
                embeds.success(
                    interaction.user,
                    `The ${type} select menu was removed from **${name}**.`
                )
            ],
            components: [],
        });

    }

};
