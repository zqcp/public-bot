const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

const Embed = require("../../models/Embed");
const embeds = require("../../embeds/embeds");

module.exports = {

    name: "embedTimestamp",

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

        const currentTimestamp =
            Array.isArray(saved.embeds) &&
            saved.embeds[0] &&
            saved.embeds[0].timestamp
                ? "yes"
                : "no";

        const input =
            new TextInputBuilder()
                .setCustomId("timestamp")
                .setLabel("Timestamp")
                .setPlaceholder("Type yes or no")
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(true)
                .setMaxLength(3)
                .setValue(
                    currentTimestamp
                );

        const modal =
            new ModalBuilder()
                .setCustomId(
                    `embedTimestampModal:${name}:${interaction.message.id}`
                )
                .setTitle("Edit Timestamp");

        modal.addComponents(
            new ActionRowBuilder()
                .addComponents(input)
        );

        return interaction.showModal(
            modal
        );

    }

};
