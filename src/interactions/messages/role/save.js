const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const Embed =
    require("../../../models/Embed");

const renderer =
    require("../../../systems/messages/renderer");

module.exports = {

    name: "roleSave",

    type: "button",

    async execute(
        client,
        interaction
    ) {

        if (!interaction.guild) {
            return;
        }

        const parts =
            interaction.customId.split(":");

        const name =
            parts[1];

        if (!name) {

            return interaction.reply({
                content:
                    "I couldn't determine which embed you're editing.",
                flags: 64
            });

        }

        try {

            const saved =
                await Embed.findOne({
                    guildId:
                        interaction.guild.id,

                    name
                });

            if (!saved) {

                return interaction.reply({
                    content:
                        `I couldn't find the embed **${name}**.`,
                    flags: 64
                });

            }

            if (
                !Array.isArray(
                    saved.components
                ) ||
                !saved.components.length
            ) {

                return interaction.reply({
                    content:
                        "There are no role selector changes to save.",
                    flags: 64
                });

            }

            const payload =
                renderer.render(
                    saved.toObject(),
                    interaction.member
                );

            const editorRow =
                new ActionRowBuilder()
                    .addComponents(

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

            const components = [
                ...(Array.isArray(
                    payload.components
                )
                    ? payload.components
                    : []),
                editorRow
            ];

            await interaction.message.edit({

                embeds:
                    Array.isArray(
                        payload.embeds
                    )
                        ? payload.embeds
                        : [],

                components

            });

            return interaction.reply({

                content:
                    `Saved the role selector for **${name}**.`,

                flags: 64

            });

        } catch (error) {

            console.error(
                "[ROLE SAVE]",
                error
            );

            return interaction.reply({
                content:
                    "I couldn't save the role selector.",
                flags: 64
            });

        }

    }

};
