Alright apply the fix for title

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

        const currentTitle =
            Array.isArray(saved.embeds) &&
            saved.embeds[0] &&
            saved.embeds[0].title
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
                .setMaxLength(256);

        /*
         * Discord does not allow setValue("")
         * on an optional text input.
         *
         * Only set the value when a title exists.
         */

        if (currentTitle) {
            input.setValue(
                currentTitle
            );
        }

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
