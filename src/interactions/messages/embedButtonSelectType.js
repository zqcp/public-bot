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

        let menuCount = 0;

        if (Array.isArray(saved.components)) {

            for (const componentRow of saved.components) {

                if (!Array.isArray(componentRow?.components)) {
                    continue;
                }

                for (const component of componentRow.components) {

                    if (!component) {
                        continue;
                    }

                    if (
                        type === "role" &&
                        component.type === 6
                    ) {
                        menuCount++;
                    }

                    if (
                        type === "user" &&
                        component.type === 5
                    ) {
                        menuCount++;
                    }

                    if (
                        type === "channel" &&
                        component.type === 8
                    ) {
                        menuCount++;
                    }

                    if (
                        type === "mentionable" &&
                        component.type === 7
                    ) {
                        menuCount++;
                    }

                }

            }

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
                            `embedSelectMenuEdit:${name}:${type}`
                        )
                        .setLabel(
                            `Edit ${selectedType}`
                        )
                        .setStyle(
                            ButtonStyle.Primary
                        )
                        .setDisabled(
                            menuCount === 0
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            `embedSelectMenuRemove:${name}:${type}`
                        )
                        .setLabel(
                            `Remove ${selectedType}`
                        )
                        .setStyle(
                            ButtonStyle.Danger
                        )
                        .setDisabled(
                            menuCount === 0
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            `embedButtonSelectOpen:${name}`
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
                    `Manage **${selectedType}** menus for embed **${name}**.`
                )
            ],
            components: [
                row
            ],
            flags: 64
        });

    }

};
