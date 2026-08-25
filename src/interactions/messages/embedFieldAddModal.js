const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");
const editor = require("../../systems/messages/editor");

module.exports = {

    name: "embedFieldAddModal",

    type: "modal",

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

        if (
            !Array.isArray(saved.embeds) ||
            !saved.embeds.length
        ) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        `Embed **${name}** doesn't have an embed to add a field to yet.`
                    )
                ],
                flags: 64
            });
        }

        if (
            !Array.isArray(
                saved.embeds[0].fields
            )
        ) {
            saved.embeds[0].fields = [];
        }

        if (
            saved.embeds[0].fields.length >= 25
        ) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        `Embed **${name}** already has the maximum of **25 fields**.`
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
            inlineInput &&
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

        saved.embeds[0].fields.push({
            name: fieldName,
            value,
            inline:
                inlineInput === "true"
        });

        saved.markModified("embeds");

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
                    `A new field has been added to **${name}**.`
                )
            ],
            flags: 64
        });

    }

};
