const {
    RoleSelectMenuBuilder,
    UserSelectMenuBuilder,
    ChannelSelectMenuBuilder,
    MentionableSelectMenuBuilder,
    ActionRowBuilder
} = require("discord.js");

const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");
const editor = require("../../systems/messages/editor");

module.exports = {

    name: "embedSelectMenuAddModal",

    type: "modal",

    async execute(client, interaction) {

        if (!interaction.guild) {
            return;
        }

        const parts =
            interaction.customId.split(":");

        const name =
            parts[1];

        const type =
            parts[2];

        if (!name || !type) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "I couldn't determine which select menu you're adding."
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

        const placeholder =
            interaction.fields
                .getTextInputValue(
                    "placeholder"
                )
                .trim();

        const customIdInput =
            interaction.fields
                .getTextInputValue(
                    "customId"
                )
                .trim();

        const disabledInput =
            interaction.fields
                .getTextInputValue(
                    "disabled"
                )
                .trim()
                .toLowerCase();

        const disabled =
            disabledInput === "true";

        let menu;

        const customId =
            customIdInput ||
            `select_${Date.now()}`;

        const menuPlaceholder =
            placeholder ||
            "Select an option...";

        if (type === "role") {

            menu =
                new RoleSelectMenuBuilder()
                    .setCustomId(customId)
                    .setPlaceholder(menuPlaceholder)
                    .setDisabled(disabled);

        } else if (type === "user") {

            menu =
                new UserSelectMenuBuilder()
                    .setCustomId(customId)
                    .setPlaceholder(menuPlaceholder)
                    .setDisabled(disabled);

        } else if (type === "channel") {

            menu =
                new ChannelSelectMenuBuilder()
                    .setCustomId(customId)
                    .setPlaceholder(menuPlaceholder)
                    .setDisabled(disabled);

        } else if (type === "mentionable") {

            menu =
                new MentionableSelectMenuBuilder()
                    .setCustomId(customId)
                    .setPlaceholder(menuPlaceholder)
                    .setDisabled(disabled);

        } else {

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

        if (!Array.isArray(saved.components)) {
            saved.components = [];
        }

        saved.components.push(
            new ActionRowBuilder()
                .addComponents(menu)
                .toJSON()
        );

        await saved.save();

        await editor.updateMessage(
            client,
            interaction.guild.id,
            name
        );

        return interaction.reply({
            embeds: [
                embeds.success(
                    interaction.user,
                    `The **${menuPlaceholder}** ${type} select menu has been added to **${name}**.`
                )
            ],
            flags: 64
        });

    }

};
