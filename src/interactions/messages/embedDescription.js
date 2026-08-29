const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

const Embed = require("../../models/Embed");
const embeds = require("../../embeds/embeds");

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

        const currentDescription =
            Array.isArray(saved.embeds) &&
            saved.embeds[0] &&
            saved.embeds[0].description
                ? String(saved.embeds[0].description)
                : "";

        const input =
            new TextInputBuilder()
                .setCustomId("description")
                .setLabel("Description")
                .setStyle(
                    TextInputStyle.Paragraph
                )
                .setRequired(false)
                .setMaxLength(4000);

        if (currentDescription) {
            input.setValue(
                currentDescription
            );
        }

        const modal =
            new ModalBuilder()
                .setCustomId(
                    `embedDescriptionModal:${name}:${interaction.message.id}`
                )
                .setTitle("Edit Description");

        modal.addComponents(
            new ActionRowBuilder()
                .addComponents(input)
        );

        return interaction.showModal(
            modal
        );

    }

};
