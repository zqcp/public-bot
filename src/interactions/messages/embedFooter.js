const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

const Embed = require("../../models/Embed");
const embeds = require("../../embeds/embeds");

module.exports = {

    name: "embedFooter",

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

        const currentFooter =
            Array.isArray(saved.embeds) &&
            saved.embeds[0] &&
            saved.embeds[0].footer
                ? saved.embeds[0].footer
                : {};

        const currentText =
            currentFooter.text
                ? String(
                    currentFooter.text
                )
                : "";

        const currentIcon =
            currentFooter.icon_url
                ? String(
                    currentFooter.icon_url
                )
                : "";

        const textInput =
            new TextInputBuilder()
                .setCustomId("footerText")
                .setLabel("Footer Text")
                .setPlaceholder(
                    "Footer text or variables"
                )
                .setStyle(
                    TextInputStyle.Paragraph
                )
                .setRequired(false)
                .setMaxLength(2048);

        const iconInput =
            new TextInputBuilder()
                .setCustomId("footerIcon")
                .setLabel("Footer Icon")
                .setPlaceholder(
                    "Image URL or supported variable"
                )
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(false)
                .setMaxLength(2048);

        if (currentText) {
            textInput.setValue(
                currentText
            );
        }

        if (currentIcon) {
            iconInput.setValue(
                currentIcon
            );
        }

        const modal =
            new ModalBuilder()
                .setCustomId(
                    `embedFooterModal:${name}:${interaction.message.id}`
                )
                .setTitle("Edit Footer");

        modal.addComponents(

            new ActionRowBuilder()
                .addComponents(
                    textInput
                ),

            new ActionRowBuilder()
                .addComponents(
                    iconInput
                )

        );

        return interaction.showModal(
            modal
        );

    }

};
