const Embed = require("../../models/Embed");
const embeds = require("../../embeds/embeds");
const variables = require("../../systems/variables");

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

        const thumbnail =
            interaction.fields
                .getTextInputValue(
                    "thumbnail"
                )
                .trim();

        const image =
            interaction.fields
                .getTextInputValue(
                    "image"
                )
                .trim();

        const saved =
            await Embed.findOne({
                guildId:
                    interaction.guild.id,
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

        if (!Array.isArray(saved.embeds)) {
            saved.embeds = [];
        }

        if (!saved.embeds.length) {
            saved.embeds.push({});
        }

        /*
         * Variables are only resolved when
         * the embed is actually rendered.
         *
         * We keep the original variable
         * inside MongoDB.
         */

        if (thumbnail) {

            if (
                !/^https?:\/\//i.test(
                    thumbnail
                ) &&
                !thumbnail.includes("{")
            ) {

                return interaction.reply({
                    embeds: [
                        embeds.error(
                            interaction.user,
                            "The thumbnail must be a valid URL or contain a supported variable."
                        )
                    ],
                    flags: 64
                });

            }

            saved.embeds[0].thumbnail = {
                url: thumbnail
            };

        } else {

            delete saved.embeds[0].thumbnail;

        }

        /*
         * Large image
         */

        if (image) {

            if (
                !/^https?:\/\//i.test(
                    image
                ) &&
                !image.includes("{")
            ) {

                return interaction.reply({
                    embeds: [
                        embeds.error(
                            interaction.user,
                            "The image must be a valid URL or contain a supported variable."
                        )
                    ],
                    flags: 64
                });

            }

            saved.embeds[0].image = {
                url: image
            };

        } else {

            delete saved.embeds[0].image;

        }

        try {

            saved.markModified(
                "embeds"
            );

            await saved.save();

            return interaction.reply({
                embeds: [
                    embeds.success(
                        interaction.user,
                        `Images for **${name}** have been updated.`
                    )
                ],
                flags: 64
            });

        } catch (error) {

            console.error(
                `[EMBED IMAGES] Failed to update ${name}:`,
                error
            );

            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        `I couldn't update the images for **${name}**.`
                    )
                ],
                flags: 64
            });

        }

    }

};
