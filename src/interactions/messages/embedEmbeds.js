const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");

module.exports = {

    name: "embedEmbeds",

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

        const count =
            Array.isArray(saved.embeds)
                ? saved.embeds.length
                : 0;

        const row =
            new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()
                        .setCustomId(
                            `embedEmbeds:${name}:add`
                        )
                        .setLabel("Add Embed")
                        .setStyle(
                            ButtonStyle.Success
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            `embedEmbeds:${name}:edit`
                        )
                        .setLabel("Edit Embed")
                        .setStyle(
                            ButtonStyle.Primary
                        )
                        .setDisabled(count === 0),

                    new ButtonBuilder()
                        .setCustomId(
                            `embedEmbeds:${name}:remove`
                        )
                        .setLabel("Remove Embed")
                        .setStyle(
                            ButtonStyle.Danger
                        )
                        .setDisabled(count === 0),

                    new ButtonBuilder()
                        .setCustomId(
                            `embedEmbeds:${name}:back`
                        )
                        .setLabel("Back")
                        .setStyle(
                            ButtonStyle.Secondary
                        )

                );

        return interaction.reply({
            embeds: [
                embeds.regular(
                    interaction.user,
                    `Embed **${name}** currently has **${count}** embed${count === 1 ? "" : "s"}.`
                )
            ],
            components: [
                row
            ],
            flags: 64
        });

    }

};
