const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const Embed = require("../../models/Embed");
const embeds = require("../../embeds/embeds");

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
                        "I couldn't determine which embed you're creating."
                    )
                ],
                flags: 64
            });
        }

        const existing =
            await Embed.findOne({
                guildId: interaction.guild.id,
                name
            });

        if (existing) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        `An embed named **${name}** already exists.`
                    )
                ],
                flags: 64
            });
        }

        await Embed.create({
            guildId: interaction.guild.id,
            name,
            content: null,
            embeds: [
                {}
            ],
            components: [],
            messages: []
        });

        const row =
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(
                            `embedEditor:${name}:open`
                        )
                        .setLabel("Open Editor")
                        .setStyle(
                            ButtonStyle.Primary
                        )
                );

        return interaction.reply({
            embeds: [
                embeds.success(
                    interaction.user,
                    `Embed **${name}** has been created.`
                )
            ],
            components: [
                row
            ],
            flags: 64
        });

    }

};
