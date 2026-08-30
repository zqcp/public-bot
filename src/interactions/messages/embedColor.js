const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

const Embed = require("../../models/Embed");
const embeds = require("../../embeds/embeds");

module.exports = {

    name: "embedColor",

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

        const currentColor =
            Array.isArray(saved.embeds) &&
            saved.embeds[0]?.color !== undefined
                ? saved.embeds[0].color
                : null;

        const color =
            new TextInputBuilder()
                .setCustomId("color")
                .setLabel("Embed color")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder(
                    "Example: #5865F2 or 5865F2"
                )
                .setRequired(false)
                .setMaxLength(7);

        if (currentColor !== null) {

            color.setValue(
                `#${Number(currentColor)
                    .toString(16)
                    .padStart(6, "0")}`
            );

        }

        const modal =
            new ModalBuilder()
                .setCustomId(
                    `embedColorModal:${name}`
                )
                .setTitle("Edit Color");

        modal.addComponents(
            new ActionRowBuilder()
                .addComponents(color)
        );

        return interaction.showModal(
            modal
        );

    }

};
