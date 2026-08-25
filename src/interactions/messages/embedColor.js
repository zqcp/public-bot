const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");

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

        const currentColor =
            saved.embeds[0].color;

        let color = "";

        if (
            typeof currentColor === "number"
        ) {
            color =
                currentColor
                    .toString(16)
                    .padStart(6, "0");
        }

        const modal =
            new ModalBuilder()
                .setCustomId(
                    `embedColorModal:${name}`
                )
                .setTitle(
                    `Edit Color: ${name}`
                );

        const input =
            new TextInputBuilder()
                .setCustomId("color")
                .setLabel("Embed Color")
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(false)
                .setPlaceholder(
                    "#5865F2"
                )
                .setValue(
                    color
                        ? `#${color}`
                        : ""
                );

        modal.addComponents(
            new ActionRowBuilder()
                .addComponents(input)
        );

        return interaction.showModal(modal);

    }

};
