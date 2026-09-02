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
                ? saved.embeds[0].footer.text || ""
                : "";

        const input =
            new TextInputBuilder()
                .setCustomId("footer")
                .setLabel("Footer")
                .setPlaceholder(
                    "Enter footer text. Variables are supported."
                )
                .setStyle(
                    TextInputStyle.Paragraph
                )
                .setRequired(false)
                .setMaxLength(2048);

        /*
         * Discord does not allow setValue("")
         * on an optional text input.
         *
         * Only set the value when a footer exists.
         */

        if (currentFooter) {
            input.setValue(
                currentFooter
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
                .addComponents(input)
        );

        return interaction.showModal(
            modal
        );

    }

};
