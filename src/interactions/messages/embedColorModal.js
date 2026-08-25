const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");
const editor = require("../../systems/messages/editor");

module.exports = {

    name: "embedColorModal",

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
                        `Embed **${name}** doesn't have an embed to edit yet.`
                    )
                ],
                flags: 64
            });
        }

        const input =
            interaction.fields
                .getTextInputValue("color")
                .trim();

        /*
         * Empty input removes the existing color.
         */

        if (!input) {

            delete saved.embeds[0].color;

        } else {

            const color =
                input
                    .replace(/^#/, "")
                    .trim();

            if (
                !/^[0-9a-fA-F]{6}$/.test(
                    color
                )
            ) {
                return interaction.reply({
                    embeds: [
                        embeds.error(
                            interaction.user,
                            "Invalid color. Use a 6-digit hexadecimal color such as `#5865F2`."
                        )
                    ],
                    flags: 64
                });
            }

            saved.embeds[0].color =
                parseInt(
                    color,
                    16
                );

        }

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
                    `The color for **${name}** has been updated.`
                )
            ],
            flags: 64
        });

    }

};
