const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");
const editor = require("../../systems/messages/editor");

module.exports = {

    name: "embedSelectMenuEditModal",

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

        const placeholder =
            interaction.fields
                .getTextInputValue("placeholder")
                .trim();

        const customId =
            interaction.fields
                .getTextInputValue("customId")
                .trim();

        const disabledInput =
            interaction.fields
                .getTextInputValue("disabled")
                .trim()
                .toLowerCase();

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

        if (placeholder) {
            component.placeholder = placeholder;
        }

        if (customId) {
            component.custom_id = customId;
        }

        component.disabled =
            disabledInput === "true";

        saved.markModified("components");

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
                    `The ${type} select menu in **${name}** has been updated.`
                )
            ],
            flags: 64
        });

    }

};
