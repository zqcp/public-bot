const {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");

module.exports = {

    name: "embedFieldRemove",

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

        const fields =
            Array.isArray(saved.embeds?.[0]?.fields)
                ? saved.embeds[0].fields
                : [];

        if (!fields.length) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        `Embed **${name}** doesn't have any fields to remove.`
                    )
                ],
                flags: 64
            });
        }

        const menu =
            new StringSelectMenuBuilder()
                .setCustomId(
                    `embedFieldRemoveSelect:${name}`
                )
                .setPlaceholder(
                    "Select a field to remove..."
                )
                .addOptions(
                    fields.map((field, index) => ({
                        label:
                            field.name.length > 100
                                ? field.name.slice(0, 97) + "..."
                                : field.name,

                        description:
                            "Remove this field",

                        value:
                            String(index)
                    }))
                );

        const row =
            new ActionRowBuilder()
                .addComponents(menu);

        const back =
            new ActionRowBuilder()
                .addComponents(
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
                    `Select the field you want to remove from **${name}**.`
                )
            ],
            components: [
                row,
                back
            ],
            flags: 64
        });

    }

};
