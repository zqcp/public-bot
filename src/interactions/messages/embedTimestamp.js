const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");

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

        const currentTimestamp =
            saved.embeds[0].timestamp;

        let value = "";

        if (currentTimestamp) {
            value =
                new Date(
                    currentTimestamp
                ).toISOString();
        }

        const modal =
            new ModalBuilder()
                .setCustomId(
                    `embedTimestampModal:${name}`
                )
                .setTitle(
                    `Edit Timestamp: ${name}`
                );

        const timestamp =
            new TextInputBuilder()
                .setCustomId("timestamp")
                .setLabel("Timestamp")
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(false)
                .setPlaceholder(
                    "2026-08-25T16:00:00.000Z"
                )
                .setValue(value);

        modal.addComponents(
            new ActionRowBuilder()
                .addComponents(timestamp)
        );

        return interaction.showModal(modal);

    }

};
