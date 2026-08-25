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

    name: "embedButtonAddModal",

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

        if (!Array.isArray(saved.components)) {
            saved.components = [];
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

        const style =
            styles[styleInput];

        if (
            style === 5 &&
            !urlOrId
        ) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "A Link button requires a URL."
                    )
                ],
                flags: 64
            });
        }

        if (
            style !== 5 &&
            !urlOrId
        ) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "A non-Link button requires a custom ID."
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

        let row =
            saved.components.find(
                componentRow =>
                    Array.isArray(
                        componentRow.components
                    ) &&
                    componentRow.components.length < 5
            );

        if (!row) {

            row = {
                type: 1,
                components: []
            };

            if (
                saved.components.length >= 5
            ) {
                return interaction.reply({
                    embeds: [
                        embeds.error(
                            interaction.user,
                            `Embed **${name}** already has the maximum of **5 button rows**.`
                        )
                    ],
                    flags: 64
                });
            }

            saved.components.push(row);
        }

        const button = {
            type: 2,
            style,
            label,
            disabled:
                disabledInput === "true"
        };

        if (style === 5) {
            button.url = urlOrId;
        } else {
            button.custom_id = urlOrId;
        }

        if (emoji) {
            button.emoji = {
                name: emoji
            };
        }

        row.components.push(
            button
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
                    `A new button has been added to **${name}**.`
                )
            ],
            flags: 64
        });

    }

};
