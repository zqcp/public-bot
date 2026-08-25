const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");

module.exports = {

    name: "embedDescription",

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
            saved.embeds[0].description || "";

        const modal =
            new ModalBuilder()
                .setCustomId(
                    `embedDescriptionModal:${name}`
                )
                .setTitle(
                    `Edit Description: ${name}`
                );

        const description =
            new TextInputBuilder()
                .setCustomId("description")
                .setLabel("Description")
                .setStyle(
                    TextInputStyle.Paragraph
                )
                .setRequired(false)
                .setPlaceholder(
                    "Enter embed description..."
                )
                .setValue(current);

        modal.addComponents(
            new ActionRowBuilder()
                .addComponents(description)
        );

        return interaction.showModal(modal);

    }

};
