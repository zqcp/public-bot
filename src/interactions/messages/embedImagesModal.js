const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");
const editor = require("../../systems/messages/editor");

module.exports = {

    name: "embedImagesModal",

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

        const thumbnail =
            interaction.fields
                .getTextInputValue("thumbnail")
                .trim();

        const image =
            interaction.fields
                .getTextInputValue("image")
                .trim();

        /*
         * Thumbnail
         */

        if (thumbnail) {

            saved.embeds[0].thumbnail = {
                url: thumbnail
            };

        } else {

            delete saved.embeds[0].thumbnail;

        }

        /*
         * Image
         */

        if (image) {

            saved.embeds[0].image = {
                url: image
            };

        } else {

            delete saved.embeds[0].image;

        }

        saved.markModified("embeds");

        await saved.save();

        /*
         * Update all existing Discord messages.
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
                    `The images for **${name}** have been updated.`
                )
            ],
            flags: 64
        });

    }

};
