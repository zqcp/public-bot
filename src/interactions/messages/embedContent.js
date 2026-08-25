const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");

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

        const modal =
            new ModalBuilder()
                .setCustomId(
                    `embedContentModal:${name}`
                )
                .setTitle(
                    `Edit Content: ${name}`
                );

        const content =
            new TextInputBuilder()
                .setCustomId("content")
                .setLabel("Message Content")
                .setStyle(
                    TextInputStyle.Paragraph
                )
                .setRequired(false)
                .setPlaceholder(
                    "Enter message content..."
                )
                .setValue(
                    saved.content || ""
                );

        modal.addComponents(
            new ActionRowBuilder()
                .addComponents(content)
        );

        return interaction.showModal(modal);

    }

};
