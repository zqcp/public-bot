const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const Embed = require("../../models/Embed");
const embeds = require("../../embeds/embeds");
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
                                `embedTitle:${name}:${interaction.message.id}`
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

            let payload;

            try {

                payload =
                    renderer.render(
                        saved.toObject(),
                        interaction.member
                    );

            } catch (error) {

                console.error(
                    `[EMBED EDITOR OPEN] Failed to render ${name}:`,
                    error
                );

                return interaction.reply({
                    embeds: [
                        embeds.error(
                            interaction.user,
                            `I couldn't render the embed **${name}**.`
                        )
                    ],
                    flags: 64
                });

            }

            try {

                return await interaction.update({
                    embeds:
                        Array.isArray(payload.embeds)
                            ? payload.embeds
                            : [],
                    components: [
                        row1,
                        row2,
                        row3
                    ]
                });

            } catch (error) {

                console.error(
                    `[EMBED EDITOR OPEN] Failed to open ${name}:`,
                    error
                );

                if (
                    !interaction.replied &&
                    !interaction.deferred
                ) {
                    return interaction.reply({
                        embeds: [
                            embeds.error(
                                interaction.user,
                                `I couldn't open the editor for **${name}**.`
                            )
                        ],
                        flags: 64
                    });
                }

                return;
            }
        }

        if (action === "save") {

            try {

                await interaction.deferReply({
                    flags: 64
                });

                /*
                 * Render the exact same embed
                 * that the editor preview uses.
                 */

                const preview =
                    renderer.render(
                        saved.toObject(),
                        interaction.member
                    );

                /*
                 * Update the sent messages directly.
                 */

                if (
                    Array.isArray(saved.messages) &&
                    saved.messages.length
                ) {

                    for (
                        const reference
                        of saved.messages
                    ) {

                        try {

                            const channel =
                                await client.channels.fetch(
                                    reference.channelId
                                );

                            const message =
                                await channel.messages.fetch(
                                    reference.messageId
                                );

                            await message.edit({
                                content:
                                    saved.content ?? null,
                                embeds:
                                    Array.isArray(
                                        preview.embeds
                                    )
                                        ? preview.embeds
                                        : []
                            });

                        } catch (error) {

                            console.error(
                                `[EMBED SAVE] Failed to update message ${reference.messageId}:`,
                                error
                            );

                        }

                    }

                }

                /*
                 * Keep the editor preview identical
                 * to the sent embed.
                 */

                await interaction.message.edit({
                    content:
                        saved.content ?? null,
                    embeds:
                        Array.isArray(
                            preview.embeds
                        )
                            ? preview.embeds
                            : []
                });

                return interaction.editReply({
                    embeds: [
                        embeds.success(
                            interaction.user,
                            `Embed **${name}** has been saved and existing messages have been updated.`
                        )
                    ]
                });

            } catch (error) {

                console.error(
                    `[EMBED SAVE] Failed to update ${name}:`,
                    error
                );

                return interaction.editReply({
                    embeds: [
                        embeds.error(
                            interaction.user,
                            `I couldn't update the existing messages for **${name}**.`
                        )
                    ]
                });

            }

        }

        if (action === "cancel") {

            const row =
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(
                                `embedEditor:${name}:open`
                            )
                            .setLabel("Open Editor")
                            .setStyle(
                                ButtonStyle.Secondary
                            )
                    );

            return interaction.update({
                components: [
                    row
                ]
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
