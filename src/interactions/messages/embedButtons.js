const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");

module.exports = {

    name: "embedButtons",

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

        const components =
            Array.isArray(saved.components)
                ? saved.components
                : [];

        const buttons =
            components
                .flatMap(row =>
                    Array.isArray(row.components)
                        ? row.components
                        : []
                )
                .filter(component =>
                    component.type === 2
                );

        const row =
            new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()
                        .setCustomId(
                            `embedButtonAdd:${name}`
                        )
                        .setLabel("Add Button")
                        .setStyle(
                            ButtonStyle.Success
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            `embedButtonEdit:${name}`
                        )
                        .setLabel("Edit Button")
                        .setStyle(
                            ButtonStyle.Primary
                        )
                        .setDisabled(
                            buttons.length === 0
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            `embedButtonRemove:${name}`
                        )
                        .setLabel("Remove Button")
                        .setStyle(
                            ButtonStyle.Danger
                        )
                        .setDisabled(
                            buttons.length === 0
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            `embedEditor:${name}:open`
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
                    `Embed **${name}** currently has **${buttons.length}** button${buttons.length === 1 ? "" : "s"}.`
                )
            ],
            components: [
                row
            ],
            flags: 64
        });

    }

};
