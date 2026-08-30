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
            saved.embeds[0] || {};

        const thumbnail =
            new TextInputBuilder()
                .setCustomId("thumbnail")
                .setLabel("Thumbnail URL")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder(
                    "URL or variable, e.g. {server.icon}"
                )
                .setRequired(false)
                .setMaxLength(1000);

        const image =
            new TextInputBuilder()
                .setCustomId("image")
                .setLabel("Image URL")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder(
                    "URL or variable, e.g. {server.banner}"
                )
                .setRequired(false)
                .setMaxLength(1000);

        if (embed.thumbnail?.url) {
            thumbnail.setValue(
                String(embed.thumbnail.url)
            );
        }

        if (embed.image?.url) {
            image.setValue(
                String(embed.image.url)
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
