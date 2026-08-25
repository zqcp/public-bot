const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");

module.exports = {

    name: "embedEditor",

    type: "button",

    async execute(client, interaction) {

        if (!interaction.guild) {
            return;
        }

        const [, name, action] =
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

        if (action === "open") {

            const row1 =
                new ActionRowBuilder()
                    .addComponents(

                        new ButtonBuilder()
                            .setCustomId(
                                `embedContent:${name}`
                            )
                            .setLabel("Content")
                            .setStyle(ButtonStyle.Secondary),

                        new ButtonBuilder()
                            .setCustomId(
                                `embedEmbeds:${name}`
                            )
                            .setLabel("Embeds")
                            .setStyle(ButtonStyle.Secondary),

                        new ButtonBuilder()
                            .setCustomId(
                                `embedDescription:${name}`
                            )
                            .setLabel("Description")
                            .setStyle(ButtonStyle.Secondary),

                        new ButtonBuilder()
                            .setCustomId(
                                `embedAuthor:${name}`
                            )
                            .setLabel("Author")
                            .setStyle(ButtonStyle.Secondary),

                        new ButtonBuilder()
                            .setCustomId(
                                `embedFooter:${name}`
                            )
                            .setLabel("Footer")
                            .setStyle(ButtonStyle.Secondary)

                    );

            const row2 =
                new ActionRowBuilder()
                    .addComponents(

                        new ButtonBuilder()
                            .setCustomId(
                                `embedFields:${name}`
                            )
                            .setLabel("Fields")
                            .setStyle(ButtonStyle.Secondary),

                        new ButtonBuilder()
                            .setCustomId(
                                `embedImages:${name}`
                            )
                            .setLabel("Images")
                            .setStyle(ButtonStyle.Secondary),

                        new ButtonBuilder()
                            .setCustomId(
                                `embedButtons:${name}`
                            )
                            .setLabel("Buttons")
                            .setStyle(ButtonStyle.Secondary),

                        new ButtonBuilder()
                            .setCustomId(
                                `embedButtonSelect:${name}`
                            )
                            .setLabel("Select Menus")
                            .setStyle(ButtonStyle.Secondary)

                    );

            const row3 =
                new ActionRowBuilder()
                    .addComponents(

                        new ButtonBuilder()
                            .setCustomId(
                                `embedEditor:${name}:save`
                            )
                            .setLabel("Save")
                            .setStyle(ButtonStyle.Success),

                        new ButtonBuilder()
                            .setCustomId(
                                `embedEditor:${name}:cancel`
                            )
                            .setLabel("Cancel")
                            .setStyle(ButtonStyle.Danger)

                    );

            return interaction.reply({
                embeds: [
                    embeds.regular(
                        interaction.user,
                        `Editing embed **${name}**. Existing information will be preserved unless you explicitly remove it.`
                    )
                ],
                components: [
                    row1,
                    row2,
                    row3
                ],
                flags: 64
            });
        }

        if (action === "save") {
            return interaction.reply({
                embeds: [
                    embeds.success(
                        interaction.user,
                        `Embed **${name}** is ready to be saved.`
                    )
                ],
                flags: 64
            });
        }

        if (action === "cancel") {
            return interaction.update({
                components: []
            });
        }

        return interaction.reply({
            embeds: [
                embeds.error(
                    interaction.user,
                    "That editor option is not available."
                )
            ],
            flags: 64
        });

    }

};
