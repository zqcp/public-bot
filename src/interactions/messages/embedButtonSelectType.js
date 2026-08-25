const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");

module.exports = {

    name: "embedButtonSelectType",

    type: "select",

    async execute(client, interaction) {

        if (!interaction.guild) {
            return;
        }

        const [, name] =
            interaction.customId.split(":");

        const type =
            interaction.values?.[0];

        if (!name || !type) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "I couldn't determine which select menu type you chose."
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

        const types = {
            role: "Role Select",
            user: "User Select",
            channel: "Channel Select",
            mentionable: "Mentionable Select"
        };

        const selectedType =
            types[type];

        if (!selectedType) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "That select menu type isn't supported."
                    )
                ],
                flags: 64
            });
        }

        const row =
            new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()
                        .setCustomId(
                            `embedSelectMenuAdd:${name}:${type}`
                        )
                        .setLabel(
                            `Add ${selectedType}`
                        )
                        .setStyle(
                            ButtonStyle.Success
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            `embedButtonSelect:${name}`
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
                    `You selected **${selectedType}** for embed **${name}**.`
                )
            ],
            components: [
                row
            ],
            flags: 64
        });

    }

};
