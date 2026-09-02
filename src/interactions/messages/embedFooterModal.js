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

        const footerText =
            interaction.fields
                .getTextInputValue(
                    "footerText"
                )
                .trim();

        const footerIcon =
            interaction.fields
                .getTextInputValue(
                    "footerIcon"
                )
                .trim();

        const saved =
            await Embed.findOne({
                guildId:
                    interaction.guild.id,

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
         * FOOTER
         *
         * Keep variables exactly as entered.
         * The renderer resolves them when
         * creating the preview.
         */

        if (
            footerText ||
            footerIcon
        ) {

            saved.embeds[0].footer = {};

            if (footerText) {

                saved.embeds[0].footer.text =
                    footerText;

            }

            if (footerIcon) {

                saved.embeds[0].footer.icon_url =
                    footerIcon;

            }

        } else {

            delete saved.embeds[0].footer;

        }

        /*
         * IMPORTANT:
         *
         * embeds is a nested array/object.
         */

        saved.markModified(
            "embeds"
        );

        await saved.save();

        /*
         * LIVE PREVIEW
         *
         * Render the exact saved embed data
         * and replace the embed on the existing
         * editor message.
         */

        if (editorMessageId) {

            try {

                const editorMessage =
                    await interaction.channel.messages.fetch(
                        editorMessageId
                    );

                const savedEmbed =
                    await Embed.findOne({
                        guildId:
                            interaction.guild.id,

                        name
                    }).lean();

                const payload =
                    renderer.render(
                        savedEmbed,
                        interaction.member
                    );

                await editorMessage.edit({
                    embeds:
                        Array.isArray(
                            payload?.embeds
                        )
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
                    footerText ||
                    footerIcon
                        ? `The footer for **${name}** has been updated.`
                        : `The footer for **${name}** has been removed.`
                )
            ]
        });

    }

};
