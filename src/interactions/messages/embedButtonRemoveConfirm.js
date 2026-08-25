const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");
const editor = require("../../systems/messages/editor");

module.exports = {

    name: "embedButtonRemoveConfirm",

    type: "button",

    async execute(client, interaction) {

        if (!interaction.guild) {
            return;
        }

        const [, name, rowIndex, buttonIndex] =
            interaction.customId.split(":");

        const row =
            Number(rowIndex);

        const index =
            Number(buttonIndex);

        if (
            !name ||
            Number.isNaN(row) ||
            Number.isNaN(index)
        ) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "I couldn't determine which button you're removing."
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

        const componentRow =
            saved.components?.[row];

        if (
            !componentRow ||
            !Array.isArray(
                componentRow.components
            )
        ) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "That button row no longer exists."
                    )
                ],
                flags: 64
            });
        }

        const button =
            componentRow.components[index];

        if (
            !button ||
            button.type !== 2
        ) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "That button no longer exists."
                    )
                ],
                flags: 64
            });
        }

        const label =
            button.label ||
            button.custom_id ||
            button.url ||
            `Button ${index + 1}`;

        /*
         * Remove only the selected button.
         */

        componentRow.components.splice(
            index,
            1
        );

        /*
         * If the row is now empty, remove
         * the empty component row as well.
         */

        if (
            componentRow.components.length === 0
        ) {
            saved.components.splice(
                row,
                1
            );
        }

        saved.markModified(
            "components"
        );

        await saved.save();

        /*
         * Update every existing Discord message
         * using this saved embed.
         */

        await editor.updateMessage(
            client,
            interaction.guild.id,
            name
        );

        return interaction.update({
            embeds: [
                embeds.success(
                    interaction.user,
                    `Button **${label}** has been removed from **${name}**.`
                )
            ],
            components: []
        });

    }

};
