const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");
const editor = require("../../systems/messages/editor");

module.exports = {

    name: "embedAddModal",

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

        const title =
            interaction.fields.getTextInputValue(
                "title"
            ).trim();

        const description =
            interaction.fields.getTextInputValue(
                "description"
            ).trim();

        const colorInput =
            interaction.fields.getTextInputValue(
                "color"
            ).trim();

        const newEmbed = {};

        if (title) {
            newEmbed.title = title;
        }

        if (description) {
            newEmbed.description = description;
        }

        if (colorInput) {

            const color =
                colorInput.replace(
                    /^#/,
                    ""
                );

            if (
                !/^[0-9A-Fa-f]{6}$/.test(
                    color
                )
            ) {
                return interaction.reply({
                    embeds: [
                        embeds.error(
                            interaction.user,
                            "The color must be a valid 6-digit hexadecimal color such as `#5865F2`."
                        )
                    ],
                    flags: 64
                });
            }

            newEmbed.color =
                parseInt(
                    color,
                    16
                );

        }

        if (
            !Array.isArray(
                saved.embeds
            )
        ) {
            saved.embeds = [];
        }

        /*
         * Add a completely new embed.
         * Existing embeds are preserved.
         */

        saved.embeds.push(
            newEmbed
        );

        await saved.save();

        /*
         * Update every Discord message
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
                    `A new embed has been added to **${name}**.`
                )
            ],
            flags: 64
        });

    }

};
