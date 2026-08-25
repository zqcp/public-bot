const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");

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

        const current =
            saved.embeds[0];

        const modal =
            new ModalBuilder()
                .setCustomId(
                    `embedImagesModal:${name}`
                )
                .setTitle(
                    `Edit Images: ${name}`
                );

        const thumbnail =
            new TextInputBuilder()
                .setCustomId("thumbnail")
                .setLabel("Thumbnail URL")
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(false)
                .setPlaceholder(
                    "https://example.com/thumbnail.png"
                )
                .setValue(
                    current.thumbnail?.url || ""
                );

        const image =
            new TextInputBuilder()
                .setCustomId("image")
                .setLabel("Image URL")
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(false)
                .setPlaceholder(
                    "https://example.com/image.png"
                )
                .setValue(
                    current.image?.url || ""
                );

        modal.addComponents(

            new ActionRowBuilder()
                .addComponents(thumbnail),

            new ActionRowBuilder()
                .addComponents(image)

        );

        return interaction.showModal(modal);

    }

};
