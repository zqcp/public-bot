const Embed = require("../../models/Embed");
const embeds = require("../../embeds/embeds");
const renderer = require("../../systems/messages/renderer");

module.exports = {

    name: "embedFooterModal",

    type: "modal",

    async execute(client, interaction) {

        if (!interaction.guild) {
            return;
        }

        await interaction.deferReply({
            flags: 64
        });

        const parts =
            interaction.customId.split(":");

        const name =
            parts[1];

        const editorMessageId =
            parts[2];

        if (!name) {
            return interaction.editReply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "I couldn't determine which embed you're editing."
                    )
                ]
            });
        }

        const footer =
            interaction.fields
                .getTextInputValue(
                    "footer"
                )
                .trim();

        const saved =
            await Embed.findOne({
                guildId: interaction.guild.id,
                name
            });

        if (!saved) {
            return interaction.editReply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        `I couldn't find an embed named **${name}**.`
                    )
                ]
            });
        }

        /*
         * Make sure the embeds array exists.
         */

        if (!Array.isArray(saved.embeds)) {
            saved.embeds = [];
        }

        /*
         * Make sure the first embed exists.
         */

        if (!saved.embeds.length) {
            saved.embeds.push({});
        }

        /*
         * Save the footer.
         *
         * Variables are intentionally NOT replaced here.
         * They stay inside the saved embed and are resolved
         * by the renderer when the embed is displayed.
         */

        if (footer) {

            if (
                typeof saved.embeds[0].footer !==
                "object" ||
                !saved.embeds[0].footer
            ) {

                saved.embeds[0].footer = {};

            }

            saved.embeds[0].footer.text =
                footer;

        } else {

            delete saved.embeds[0].footer;

        }

        /*
         * IMPORTANT:
         *
         * embeds is a nested array/object.
         * Explicitly tell Mongoose that it changed.
         */

        saved.markModified("embeds");

        await saved.save();

        /*
         * LIVE PREVIEW
         */

        if (editorMessageId) {

            try {

                const editorMessage =
                    await interaction.message.channel.messages.fetch(
                        editorMessageId
                    );

                const payload =
                    renderer.render(
                        saved.toObject(),
                        interaction.member
                    );

                await editorMessage.edit({
                    embeds:
                        Array.isArray(payload.embeds)
                            ? payload.embeds
                            : []
                });

            } catch (error) {

                console.error(
                    `[EMBED FOOTER PREVIEW] Failed to update ${name}:`,
                    error
                );

            }

        }

        return interaction.editReply({
            embeds: [
                embeds.success(
                    interaction.user,
                    footer
                        ? `The footer for **${name}** has been updated.`
                        : `The footer for **${name}** has been removed.`
                )
            ]
        });

    }

};
