const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

const Embed = require("../../models/Embed");
const embeds = require("../../embeds/embeds");

module.exports = {

    name: "embedContent",

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

        const content =
            new TextInputBuilder()
                .setCustomId("content")
                .setLabel("Message content")
                .setStyle(
                    TextInputStyle.Paragraph
                )
                .setPlaceholder(
                    "Enter the message content..."
                )
                .setRequired(false)
                .setMaxLength(2000);

        if (saved.content) {

            content.setValue(
                saved.content
            );

        }

        const modal =
            new ModalBuilder()
                .setCustomId(
                    `embedContentModal:${name}`
                )
                .setTitle(
                    "Edit Content"
                );

        modal.addComponents(
            new ActionRowBuilder()
                .addComponents(
                    content
                )
        );

        return interaction.showModal(
            modal
        );

    }

};
