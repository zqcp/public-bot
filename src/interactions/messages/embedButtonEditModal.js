const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");
const editor = require("../../systems/messages/editor");

const styles = {
    primary: 1,
    secondary: 2,
    success: 3,
    danger: 4,
    link: 5
};

module.exports = {

    name: "embedButtonEditModal",

    type: "modal",

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
                        "I couldn't determine which button you're editing."
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

        const button =
            saved.components?.[row]
                ?.components?.[index];

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
            interaction.fields
                .getTextInputValue("label")
                .trim();

        const styleInput =
            interaction.fields
                .getTextInputValue("style")
                .trim()
                .toLowerCase();

        const urlOrId =
            interaction.fields
                .getTextInputValue("url")
                .trim();

        const emoji =
            interaction.fields
                .getTextInputValue("emoji")
                .trim();

        const disabledInput =
            interaction.fields
                .getTextInputValue("disabled")
                .trim()
                .toLowerCase();

        if (!label) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "A button label is required."
                    )
                ],
                flags: 64
            });
        }

        if (!styles[styleInput]) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "Invalid button style. Use `Primary`, `Secondary`, `Success`, `Danger`, or `Link`."
                    )
                ],
                flags: 64
            });
        }

        if (
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

        const style =
            styles[styleInput];

        if (!urlOrId) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        style === 5
                            ? "A Link button requires a URL."
                            : "A button requires a custom ID."
                    )
                ],
                flags: 64
            });
        }

        if (
            style === 5 &&
            !/^https?:\/\//i.test(
                urlOrId
            )
        ) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "The Link button URL must start with `http://` or `https://`."
                    )
                ],
                flags: 64
            });
        }

        /*
         * Preserve the existing button object
         * and only replace the properties being edited.
         */

        button.type = 2;
        button.style = style;
        button.label = label;
        button.disabled =
            disabledInput === "true";

        if (style === 5) {

            button.url = urlOrId;

            delete button.custom_id;

        } else {

            button.custom_id = urlOrId;

            delete button.url;

        }

        if (emoji) {

            button.emoji = {
                name: emoji
            };

        } else {

            delete button.emoji;

        }

        saved.markModified(
            "components"
        );

        await saved.save();

        /*
         * Update all Discord messages using
         * this saved embed.
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
                    `The button in **${name}** has been updated.`
                )
            ],
            flags: 64
        });

    }

};
