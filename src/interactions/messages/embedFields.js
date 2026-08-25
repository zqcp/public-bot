const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");

module.exports = {

    name: "embedFields",

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

        const fields =
            Array.isArray(saved.embeds[0].fields)
                ? saved.embeds[0].fields
                : [];

        const row =
            new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()
                        .setCustomId(
                            `embedFields:${name}:add`
                        )
                        .setLabel("Add Field")
                        .setStyle(
                            ButtonStyle.Success
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            `embedFields:${name}:edit`
                        )
                        .setLabel("Edit Field")
                        .setStyle(
                            ButtonStyle.Primary
                        )
                        .setDisabled(
                            fields.length === 0
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            `embedFields:${name}:remove`
                        )
                        .setLabel("Remove Field")
                        .setStyle(
                            ButtonStyle.Danger
                        )
                        .setDisabled(
                            fields.length === 0
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            `embedFields:${name}:back`
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
                    `Embed **${name}** currently has **${fields.length}** field${fields.length === 1 ? "" : "s"}.`
                )
            ],
            components: [
                row
            ],
            flags: 64
        });

    }

};
