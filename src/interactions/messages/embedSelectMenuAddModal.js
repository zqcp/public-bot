const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");
const editor = require("../../systems/messages/editor");

module.exports = {

    name: "embedSelectMenuAddModal",

    type: "modal",

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

        if (!Array.isArray(saved.components)) {
            saved.components = [];
        }

        const placeholder =
            interaction.fields
                .getTextInputValue(
                    "placeholder"
                )
                .trim();

        const customId =
            interaction.fields
                .getTextInputValue(
                    "customId"
                )
                .trim();

        const disabledInput =
            interaction.fields
                .getTextInputValue(
                    "disabled"
                )
                .trim()
                .toLowerCase();

        if (!customId) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "A Custom ID is required."
                    )
                ],
                flags: 64
            });
        }

        if (
            disabledInput &&
            disabledInput !== "true" &&
            disabledInput !== "false"
        ) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "Disabled must be either `true` or `false`."
                    )
                ],
                flags: 64
            });
        }

        const typeMap = {
            role: 6,
            user: 5,
            mentionable: 7,
            channel: 8
        };

        const componentType =
            typeMap[type];

        if (!componentType) {
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

        let row =
            saved.components.find(
                componentRow =>
                    componentRow &&
                    componentRow.type === 1 &&
                    Array.isArray(
                        componentRow.components
                    ) &&
                    componentRow.components.length < 5
            );

        if (!row) {

            if (saved.components.length >= 5) {
                return interaction.reply({
                    embeds: [
                        embeds.error(
                            interaction.user,
                            `Embed **${name}** already has the maximum of **5 component rows**.`
                        )
                    ],
                    flags: 64
                });
            }

            row = {
                type: 1,
                components: []
            };

            saved.components.push(row);
        }

        const selectMenu = {
            type: componentType,
            custom_id: customId,
            disabled:
                disabledInput === "true"
        };

        if (placeholder) {
            selectMenu.placeholder =
                placeholder;
        }

        row.components.push(
            selectMenu
        );

        saved.markModified(
            "components"
        );

        await saved.save();

        await editor.updateMessage(
            client,
            interaction.guild.id,
            name
        );

        return interaction.reply({
            embeds: [
                embeds.success(
                    interaction.user,
                    `A new ${type} select menu has been added to **${name}**.`
                )
            ],
            flags: 64
        });

    }

};
