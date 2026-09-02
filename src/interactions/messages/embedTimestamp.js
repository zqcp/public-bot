const {
    ActionRowBuilder,
    StringSelectMenuBuilder
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
                ? true
                : false;

        const menu =
            new StringSelectMenuBuilder()
                .setCustomId(
                    `embedTimestampSelect:${name}`
                )
                .setPlaceholder(
                    "Enable or disable timestamp"
                )
                .addOptions(
                    {
                        label: "Yes",
                        description: "Add a timestamp to the embed.",
                        value: "yes",
                        default: currentTimestamp
                    },
                    {
                        label: "No",
                        description: "Remove the timestamp from the embed.",
                        value: "no",
                        default: !currentTimestamp
                    }
                );

        const row =
            new ActionRowBuilder()
                .addComponents(
                    menu
                );

        return interaction.reply({
            components: [
                row
            ],
            flags: 64
        });

    }

};
