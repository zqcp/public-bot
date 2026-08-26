const {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} = require("discord.js");

const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");

module.exports = {

    name: "embedButtonSelectOpen",

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

        const menu =
            new StringSelectMenuBuilder()
                .setCustomId(
                    `embedButtonSelectType:${name}`
                )
                .setPlaceholder(
                    "Choose a select menu type..."
                )
                .addOptions(

                    new StringSelectMenuOptionBuilder()
                        .setLabel("Role Select")
                        .setDescription(
                            "Allow users to select a role."
                        )
                        .setValue("role"),

                    new StringSelectMenuOptionBuilder()
                        .setLabel("User Select")
                        .setDescription(
                            "Allow users to select a user."
                        )
                        .setValue("user"),

                    new StringSelectMenuOptionBuilder()
                        .setLabel("Channel Select")
                        .setDescription(
                            "Allow users to select a channel."
                        )
                        .setValue("channel"),

                    new StringSelectMenuOptionBuilder()
                        .setLabel("Mentionable Select")
                        .setDescription(
                            "Allow users to select a user or role."
                        )
                        .setValue("mentionable")

                );

        const row =
            new ActionRowBuilder()
                .addComponents(menu);

        return interaction.reply({
            embeds: [
                embeds.regular(
                    interaction.user,
                    `Choose the type of select menu you want to add to **${name}**.`
                )
            ],
            components: [
                row
            ],
            flags: 64
        });

    }

};
