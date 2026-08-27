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

        const parts =
            interaction.customId.split(":");

        const name =
            parts[1];

        /*
         * The editor message ID is included when the
         * button was created by the private embed editor.
         *
         * If it isn't included, use the message that
         * contains the button.
         */

        const editorMessageId =
            parts[2] ||
            interaction.message.id;

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

        /*
         * Read the currently saved title.
         *
         * This means reopening the modal shows the
         * title that was actually saved in MongoDB.
         */

        const currentTitle =
            Array.isArray(saved.embeds) &&
            saved.embeds[0]?.title
                ? String(saved.embeds[0].title)
                : "";

        const input =
            new TextInputBuilder()
                .setCustomId("title")
                .setLabel("Title")
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(false)
                .setMaxLength(256)
                .setValue(
                    currentTitle
                );

        /*
         * Pass both the embed name and the private
         * editor message ID to the modal.
         */

        const modal =
            new ModalBuilder()
                .setCustomId(
                    `embedTitleModal:${name}:${editorMessageId}`
                )
                .setTitle("Edit Title");

        modal.addComponents(
            new ActionRowBuilder()
                .addComponents(input)
        );

        return interaction.showModal(modal);

    }

};
