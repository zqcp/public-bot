const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

const Embed = require("../../models/Embed");
const embeds = require("../../embeds/embeds");

module.exports = {

    name: "embedImages",

    type: "button",

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

        const current =
            Array.isArray(saved.embeds) &&
            saved.embeds[0]
                ? saved.embeds[0]
                : {};

        const thumbnail =
            new TextInputBuilder()
                .setCustomId("thumbnail")
                .setLabel("Thumbnail URL")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder(
                    "https://example.com/thumbnail.png"
                )
                .setRequired(false)
                .setMaxLength(1000);

        const image =
            new TextInputBuilder()
                .setCustomId("image")
                .setLabel("Image URL")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder(
                    "https://example.com/image.png"
                )
                .setRequired(false)
                .setMaxLength(1000);

        if (current.thumbnail?.url) {

            thumbnail.setValue(
                current.thumbnail.url
            );

        }

        if (current.image?.url) {

            image.setValue(
                current.image.url
            );

        }

        const modal =
            new ModalBuilder()
                .setCustomId(
                    `embedImagesModal:${name}`
                )
                .setTitle("Edit Images");

        modal.addComponents(

            new ActionRowBuilder()
                .addComponents(
                    thumbnail
                ),

            new ActionRowBuilder()
                .addComponents(
                    image
                )

        );

        return interaction.showModal(
            modal
        );

    }

};
