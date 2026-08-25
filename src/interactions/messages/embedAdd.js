const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");

module.exports = {

    name: "embedAdd",

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
                    `embedAddModal:${name}`
                )
                .setTitle(
                    `Add Embed: ${name}`
                );

        const title =
            new TextInputBuilder()
                .setCustomId("title")
                .setLabel("Title")
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(false)
                .setPlaceholder(
                    "Enter an embed title..."
                );

        const description =
            new TextInputBuilder()
                .setCustomId("description")
                .setLabel("Description")
                .setStyle(
                    TextInputStyle.Paragraph
                )
                .setRequired(false)
                .setPlaceholder(
                    "Enter an embed description..."
                );

        const color =
            new TextInputBuilder()
                .setCustomId("color")
                .setLabel("Color")
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(false)
                .setPlaceholder(
                    "#5865F2"
                );

        modal.addComponents(

            new ActionRowBuilder()
                .addComponents(title),

            new ActionRowBuilder()
                .addComponents(description),

            new ActionRowBuilder()
                .addComponents(color)

        );

        return interaction.showModal(modal);

    }

};
