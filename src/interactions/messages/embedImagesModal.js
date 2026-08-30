const Embed = require("../../models/Embed");
const embeds = require("../../embeds/embeds");

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

        if (!Array.isArray(saved.embeds)) {
            saved.embeds = [];
        }

        if (!saved.embeds.length) {
            saved.embeds.push({});
        }

        const embed =
            JSON.parse(
                JSON.stringify(
                    saved.embeds[0] || {}
                )
            );

        /*
         * IMAGE VARIABLES
         *
         * Variables are intentionally stored
         * exactly as entered.
         *
         * Examples:
         *
         * {server.icon}
         * {server.banner}
         * {user.avatar}
         *
         * They are resolved by the existing
         * message system when the embed is used.
         */

        if (thumbnail) {

            const isUrl =
                /^https?:\/\/\S+$/i.test(
                    thumbnail
                );

            const isVariable =
                /^\{[^{}]+\}$/.test(
                    thumbnail
                );

            if (!isUrl && !isVariable) {

                return interaction.reply({
                    embeds: [
                        embeds.error(
                            interaction.user,
                            "The thumbnail must be a valid URL or a supported variable such as `{server.icon}`."
                        )
                    ],
                    flags: 64
                });

            }

            embed.thumbnail = {
                url: thumbnail
            };

        } else {

            delete embed.thumbnail;

        }

        /*
         * LARGE IMAGE
         */

        if (image) {

            const isUrl =
                /^https?:\/\/\S+$/i.test(
                    image
                );

            const isVariable =
                /^\{[^{}]+\}$/.test(
                    image
                );

            if (!isUrl && !isVariable) {

                return interaction.reply({
                    embeds: [
                        embeds.error(
                            interaction.user,
                            "The image must be a valid URL or a supported variable such as `{server.banner}`."
                        )
                    ],
                    flags: 64
                });

            }

            embed.image = {
                url: image
            };

        } else {

            delete embed.image;

        }

        saved.embeds[0] =
            embed;

        saved.markModified(
            "embeds"
        );

        try {

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
