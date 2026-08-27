const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

const Embed = require("../../models/Embed");
const embeds = require("../../embeds/embeds");

module.exports = {

    name: "embedTitle",

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

        const input =
            new TextInputBuilder()
                .setCustomId("title")
                .setLabel("Title")
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(false)
                .setMaxLength(256);

        const modal =
            new ModalBuilder()
                .setCustomId(
                    `embedTitleModal:${name}:${interaction.message.id}`
                )
                .setTitle("Edit Title");

        modal.addComponents(
            new ActionRowBuilder()
                .addComponents(input)
        );

        return interaction.showModal(
            modal
        );

    }

};
