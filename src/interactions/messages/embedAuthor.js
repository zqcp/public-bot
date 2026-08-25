const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");

module.exports = {

    name: "embedAuthor",

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

        const firstEmbed =
            Array.isArray(saved.embeds) &&
            saved.embeds.length
                ? saved.embeds[0]
                : {};

        const author =
            firstEmbed.author || {};

        const modal =
            new ModalBuilder()
                .setCustomId(
                    `embedAuthorModal:${name}`
                )
                .setTitle(
                    `Edit Author: ${name}`
                );

        const authorName =
            new TextInputBuilder()
                .setCustomId("name")
                .setLabel("Author Name")
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(false)
                .setPlaceholder(
                    "Enter author name..."
                )
                .setValue(
                    author.name || ""
                );

        const authorUrl =
            new TextInputBuilder()
                .setCustomId("url")
                .setLabel("Author URL")
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(false)
                .setPlaceholder(
                    "https://example.com"
                )
                .setValue(
                    author.url || ""
                );

        const iconUrl =
            new TextInputBuilder()
                .setCustomId("iconURL")
                .setLabel("Author Icon URL")
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(false)
                .setPlaceholder(
                    "https://example.com/icon.png"
                )
                .setValue(
                    author.icon_url ||
                    author.iconURL ||
                    ""
                );

        modal.addComponents(

            new ActionRowBuilder()
                .addComponents(authorName),

            new ActionRowBuilder()
                .addComponents(authorUrl),

            new ActionRowBuilder()
                .addComponents(iconUrl)

        );

        return interaction.showModal(modal);

    }

};
