const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
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
                saved.markModified("embeds");
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
             */

            let preview;

            try {

                preview =
                    renderer.render(
                        saved.toObject()
                    );

            } catch (error) {

                console.error(
                    `[EMBED EDITOR PREVIEW] Failed to render ${name}:`,
                    error
                );

                preview = null;

            }

            /*
             * Discord requires the interaction response
             * to contain actual message content.
             *
             * Start with an invisible embed so an empty
             * embed configuration is still valid.
             */

            let previewEmbed =
                new EmbedBuilder()
                    .setDescription("\u200B");

            /*
             * If the renderer produced an embed,
             * use the saved embed instead.
             */

            if (
                preview &&
                Array.isArray(preview.embeds) &&
                preview.embeds.length
            ) {

                try {

                    previewEmbed =
                        EmbedBuilder.from(
                            preview.embeds[0]
                        );

                } catch (error) {

                    console.error(
                        `[EMBED EDITOR PREVIEW] Invalid rendered embed for ${name}:`,
                        error
                    );

                }

            }

            /*
             * Send the private editor message.
             */

            const response =
                await interaction.reply({
                    embeds: [
                        previewEmbed
                    ],
                    components: [
                        row1,
                        row2,
                        row3
                    ],
                    flags: 64,
                    fetchReply: true
                });

            /*
             * Store the editor message ID in the Title
             * button so the modal knows exactly which
             * private preview message to update.
             *
             * Keep every other button unchanged.
             */

            row1.components[1] =
                new ButtonBuilder()
                    .setCustomId(
                        `embedTitle:${name}:${response.id}`
                    )
                    .setLabel("Title")
                    .setStyle(
                        ButtonStyle.Secondary
                    );

            /*
             * Update the private editor message with
             * the corrected Title button.
             */

            return response.edit({
                embeds: [
                    previewEmbed
                ],
                components: [
                    row1,
                    row2,
                    row3
                ]
            });
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
