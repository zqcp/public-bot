const {
    EmbedBuilder
} = require("discord.js");

const Embed = require("../../models/Embed");
const embeds = require("../../embeds/embeds");

module.exports = {

    name: "embedTitleModal",

    type: "modal",

    async execute(client, interaction) {

        if (!interaction.guild) {
            return;
        }

        /*
         * Acknowledge the modal immediately.
         * This prevents Discord's 3-second
         * interaction timeout.
         */

        await interaction.deferReply({
            flags: 64
        });

        const parts =
            interaction.customId.split(":");

        const name = parts[1];
        const editorMessageId = parts[2];

        if (!name) {
            return interaction.editReply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "I couldn't determine which embed you're editing."
                    )
                ]
            });
        }

        const title =
            interaction.fields
                .getTextInputValue("title")
                .trim();

        const saved =
            await Embed.findOne({
                guildId: interaction.guild.id,
                name
            });

        if (!saved) {
            return interaction.editReply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        `I couldn't find an embed named **${name}**.`
                    )
                ]
            });
        }

        /*
         * Make sure the embed array exists.
         */

        if (!Array.isArray(saved.embeds)) {
            saved.embeds = [];
        }

        if (!saved.embeds.length) {
            saved.embeds.push({});
        }

        /*
         * Update only the title.
         * Everything else remains unchanged.
         */

        if (title) {
            saved.embeds[0].title = title;
        } else {
            delete saved.embeds[0].title;
        }

        await saved.save();

        /*
         * Update the private editor preview immediately.
         *
         * IMPORTANT:
         * Build the preview from the complete saved embed
         * so title changes do not erase description,
         * color, footer, author, images, fields, etc.
         */

        if (editorMessageId) {

            try {

                const editorMessage =
                    await interaction.channel.messages.fetch(
                        editorMessageId
                    );

                if (editorMessage) {

                    const embedData =
                        saved.embeds[0] || {};

                    const preview =
                        new EmbedBuilder();

                    /*
                     * Copy the complete embed data.
                     */

                    if (embedData.title) {
                        preview.setTitle(
                            String(embedData.title)
                        );
                    }

                    if (embedData.description) {
                        preview.setDescription(
                            String(embedData.description)
                        );
                    }

                    if (embedData.color) {
                        preview.setColor(
                            embedData.color
                        );
                    }

                    if (embedData.url) {
                        preview.setURL(
                            String(embedData.url)
                        );
                    }

                    if (embedData.timestamp) {
                        preview.setTimestamp(
                            embedData.timestamp
                        );
                    }

                    if (embedData.author) {
                        preview.setAuthor(
                            embedData.author
                        );
                    }

                    if (embedData.footer) {
                        preview.setFooter(
                            embedData.footer
                        );
                    }

                    if (embedData.thumbnail) {
                        preview.setThumbnail(
                            embedData.thumbnail.url ||
                            embedData.thumbnail
                        );
                    }

                    if (embedData.image) {
                        preview.setImage(
                            embedData.image.url ||
                            embedData.image
                        );
                    }

                    if (Array.isArray(embedData.fields)) {
                        preview.addFields(
                            embedData.fields
                        );
                    }

                    await editorMessage.edit({
                        embeds: [
                            preview
                        ]
                    });

                }

            } catch (error) {

                console.error(
                    `[EMBED TITLE PREVIEW] Failed to update editor for ${name}:`,
                    error
                );

            }

        }

        /*
         * The title is saved immediately.
         * The Save button remains responsible for
         * publishing the saved embed to existing messages.
         */

        return interaction.editReply({
            embeds: [
                embeds.success(
                    interaction.user,
                    title
                        ? `The title for **${name}** has been updated.`
                        : `The title for **${name}** has been removed.`
                )
            ]
        });

    }

};
