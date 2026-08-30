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

            /*
             * Render the current saved embed data.
             *
             * This uses the same saved data that
             * ,embed send uses.
             */

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

            /*
             * Edit the ORIGINAL ,embed edit message.
             *
             * The saved embed is placed into that same
             * message along with the editor buttons.
             *
             * No second message is created.
             */

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

                /*
                 * Acknowledge the button immediately so
                 * Discord does not expire the interaction
                 * while the existing messages are updated.
                 */

                await interaction.deferReply({
                    flags: 64
                });

                /*
                 * Apply the saved embed data to every
                 * message created with ,embed send.
                 */

                await editor.updateMessage(
                    client,
                    interaction.guild.id,
                    name
                );

                /*
                 * Also refresh this editor message so
                 * it immediately shows the latest data.
                 */

                const updated =
                    await Embed.findOne({
                        guildId: interaction.guild.id,
                        name
                    });

                if (updated) {

                    const payload =
                        require("../../systems/messages/renderer")
                            .render(
                                updated.toObject(),
                                interaction.member
                            );

                    await interaction.message.edit({
                        embeds:
                            Array.isArray(payload.embeds)
                                ? payload.embeds
                                : []
                    });

                }

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

                if (interaction.deferred) {
                    return interaction.editReply({
                        embeds: [
                            embeds.error(
                                interaction.user,
                                `I couldn't update the existing messages for **${name}**.`
                            )
                        ]
                    });
                }

                if (!interaction.replied) {
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

                return;
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
