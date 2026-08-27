const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const Embed = require("../../models/Embed");
const embeds = require("../../embeds/embeds");
const editor = require("../../systems/messages/editor");
const renderer = require("../../systems/messages/renderer");

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

            if (!Array.isArray(saved.embeds)) {
                saved.embeds = [];
            }

            if (!saved.embeds.length) {
                saved.embeds.push({});
                await saved.save();
            }

            const row1 =
                new ActionRowBuilder()
                    .addComponents(

                        new ButtonBuilder()
                            .setCustomId(
                                `embedContent:${name}`
                            )
                            .setLabel("Content")
                            .setStyle(
                                ButtonStyle.Secondary
                            ),

                        new ButtonBuilder()
                            .setCustomId(
                                `embedTitle:${name}`
                            )
                            .setLabel("Title")
                            .setStyle(
                                ButtonStyle.Secondary
                            ),

                        new ButtonBuilder()
                            .setCustomId(
                                `embedDescription:${name}`
                            )
                            .setLabel("Description")
                            .setStyle(
                                ButtonStyle.Secondary
                            ),

                        new ButtonBuilder()
                            .setCustomId(
                                `embedAuthor:${name}`
                            )
                            .setLabel("Author")
                            .setStyle(
                                ButtonStyle.Secondary
                            ),

                        new ButtonBuilder()
                            .setCustomId(
                                `embedFooter:${name}`
                            )
                            .setLabel("Footer")
                            .setStyle(
                                ButtonStyle.Secondary
                            )

                    );

            const row2 =
                new ActionRowBuilder()
                    .addComponents(

                        new ButtonBuilder()
                            .setCustomId(
                                `embedColor:${name}`
                            )
                            .setLabel("Color")
                            .setStyle(
                                ButtonStyle.Secondary
                            ),

                        new ButtonBuilder()
                            .setCustomId(
                                `embedTimestamp:${name}`
                            )
                            .setLabel("Timestamp")
                            .setStyle(
                                ButtonStyle.Secondary
                            ),

                        new ButtonBuilder()
                            .setCustomId(
                                `embedFields:${name}`
                            )
                            .setLabel("Fields")
                            .setStyle(
                                ButtonStyle.Secondary
                            ),

                        new ButtonBuilder()
                            .setCustomId(
                                `embedImages:${name}`
                            )
                            .setLabel("Images")
                            .setStyle(
                                ButtonStyle.Secondary
                            ),

                        new ButtonBuilder()
                            .setCustomId(
                                `embedButtons:${name}`
                            )
                            .setLabel("Buttons")
                            .setStyle(
                                ButtonStyle.Secondary
                            )

                    );

            const row3 =
                new ActionRowBuilder()
                    .addComponents(

                        new ButtonBuilder()
                            .setCustomId(
                                `embedSelectMenuEdit:${name}:role`
                            )
                            .setLabel("Role Select")
                            .setStyle(
                                ButtonStyle.Secondary
                            ),

                        new ButtonBuilder()
                            .setCustomId(
                                `embedEditor:${name}:save`
                            )
                            .setLabel("Save")
                            .setStyle(
                                ButtonStyle.Success
                            ),

                        new ButtonBuilder()
                            .setCustomId(
                                `embedEditor:${name}:cancel`
                            )
                            .setLabel("Cancel")
                            .setStyle(
                                ButtonStyle.Danger
                            )

                    );

            /*
             * Render the current saved embed.
             *
             * If the embed is completely empty, use a
             * zero-width space so Discord accepts it.
             */

            const data =
                saved.toObject();

            const preview =
                renderer.render(data);

            const response = {
                components: [
                    row1,
                    row2,
                    row3
                ],
                flags: 64
            };

            if (
                Array.isArray(preview.embeds) &&
                preview.embeds.length
            ) {

                response.embeds =
                    preview.embeds;

            } else {

                response.embeds = [
                    {
                        description: "\u200B"
                    }
                ];

            }

            return interaction.reply(
                response
            );
        }

        if (action === "save") {

            try {

                await editor.updateMessage(
                    client,
                    interaction.guild.id,
                    name
                );

                return interaction.reply({
                    embeds: [
                        embeds.success(
                            interaction.user,
                            `Embed **${name}** has been saved and existing messages have been updated.`
                        )
                    ],
                    flags: 64
                });

            } catch (error) {

                console.error(
                    `[EMBED SAVE] Failed to update ${name}:`,
                    error
                );

                return interaction.reply({
                    embeds: [
                        embeds.error(
                            interaction.user,
                            `I couldn't update the existing messages for **${name}**.`
                        )
                    ],
                    flags: 64
                });

            }
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
