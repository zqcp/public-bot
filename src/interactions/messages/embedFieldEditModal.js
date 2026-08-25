const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");
const editor = require("../../systems/messages/editor");

module.exports = {

    name: "embedFieldEditModal",

    type: "modal",

    async execute(client, interaction) {

        if (!interaction.guild) {
            return;
        }

        const [, name, index] =
            interaction.customId.split(":");

        const fieldIndex =
            Number(index);

        if (
            !name ||
            Number.isNaN(fieldIndex)
        ) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "I couldn't determine which field you're editing."
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

        const fieldName =
            interaction.fields
                .getTextInputValue("name")
                .trim();

        const value =
            interaction.fields
                .getTextInputValue("value")
                .trim();

        const inlineInput =
            interaction.fields
                .getTextInputValue("inline")
                .trim()
                .toLowerCase();

        if (!fieldName || !value) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "Field name and field value are required."
                    )
                ],
                flags: 64
            });
        }

        if (
            inlineInput !== "true" &&
            inlineInput !== "false"
        ) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "Inline must be either `true` or `false`."
                    )
                ],
                flags: 64
            });
        }

        /*
         * Only update the selected field.
         */

        fields[fieldIndex] = {
            ...fields[fieldIndex],
            name: fieldName,
            value,
            inline:
                inlineInput === "true"
        };

        saved.embeds[0].fields =
            fields;

        saved.markModified("embeds");

        await saved.save();

        /*
         * Update all existing Discord messages
         * connected to this saved embed.
         */

        await editor.updateMessage(
            client,
            interaction.guild.id,
            name
        );

        return interaction.reply({
            embeds: [
                embeds.success(
                    interaction.user,
                    `Field **${fieldIndex + 1}** in **${name}** has been updated.`
                )
            ],
            flags: 64
        });

    }

};
