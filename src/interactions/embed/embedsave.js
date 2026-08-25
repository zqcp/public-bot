const {
    EmbedBuilder
} = require("discord.js");

const config = require("../../config");

const Embed =
    require("../../models/embed");


module.exports = {

    type: "button",

    name: "embed_save",

    async execute(interaction) {

        // =========================
        // GET EMBED ID
        // =========================

        const parts =
            interaction.customId.split(":");

        const embedId =
            parts[1];


        // =========================
        // CHECK EMBED ID
        // =========================

        if (!embedId) {

            const embed =
                new EmbedBuilder()
                    .setColor(
                        config.colors.failed
                    )
                    .setDescription(
                        `${config.emojis.failed} ${interaction.client.user}: This embed could not be found.`
                    );

            return interaction.reply({

                embeds: [
                    embed
                ],

                flags: 64

            });
        }


        // =========================
        // GET SAVED EMBED
        // =========================

        const savedEmbed =
            await Embed.findById(
                embedId
            );


        if (!savedEmbed) {

            const embed =
                new EmbedBuilder()
                    .setColor(
                        config.colors.failed
                    )
                    .setDescription(
                        `${config.emojis.failed} ${interaction.client.user}: This embed no longer exists.`
                    );

            return interaction.reply({

                embeds: [
                    embed
                ],

                flags: 64

            });
        }


        // =========================
        // OWNER CHECK
        // =========================

        if (
            savedEmbed.creatorId !==
            interaction.user.id
        ) {

            const embed =
                new EmbedBuilder()
                    .setColor(
                        config.colors.failed
                    )
                    .setDescription(
                        `${config.emojis.failed} ${interaction.client.user}: You can't edit this embed because you didn't create it.`
                    );

            return interaction.reply({

                embeds: [
                    embed
                ],

                flags: 64

            });
        }


        // =========================
        // BUILD EMBED
        // =========================

        const output =
            new EmbedBuilder()
                .setColor(
                    savedEmbed.color ||
                    config.colors.regular
                );


        // =========================
        // TITLE
        // =========================

        if (
            savedEmbed.title
        ) {

            output.setTitle(
                savedEmbed.title
            );

        }


        // =========================
        // DESCRIPTION
        // =========================

        if (
            savedEmbed.description
        ) {

            output.setDescription(
                savedEmbed.description
            );

        }


        // =========================
        // AUTHOR
        // =========================

        if (
            savedEmbed.author &&
            savedEmbed.author.name
        ) {

            const author = {
                name:
                    savedEmbed.author.name
            };


            if (
                savedEmbed.author.iconURL
            ) {

                author.iconURL =
                    savedEmbed.author.iconURL;

            }


            if (
                savedEmbed.author.url
            ) {

                author.url =
                    savedEmbed.author.url;

            }


            output.setAuthor(
                author
            );

        }


        // =========================
        // FOOTER
        // =========================

        if (
            savedEmbed.footer &&
            savedEmbed.footer.text
        ) {

            const footer = {
                text:
                    savedEmbed.footer.text
            };


            if (
                savedEmbed.footer.iconURL
            ) {

                footer.iconURL =
                    savedEmbed.footer.iconURL;

            }


            output.setFooter(
                footer
            );

        }


        // =========================
        // IMAGE
        // =========================

        if (
            savedEmbed.image &&
            savedEmbed.image.url
        ) {

            output.setImage(
                savedEmbed.image.url
            );

        }


        // =========================
        // THUMBNAIL
        // =========================

        if (
            savedEmbed.thumbnail &&
            savedEmbed.thumbnail.url
        ) {

            output.setThumbnail(
                savedEmbed.thumbnail.url
            );

        }


        // =========================
        // FIELDS
        // =========================

        if (
            savedEmbed.fields &&
            savedEmbed.fields.length
        ) {

            output.addFields(
                savedEmbed.fields.map(
                    field => ({

                        name:
                            field.name,

                        value:
                            field.value,

                        inline:
                            field.inline

                    })
                )
            );

        }


        // =========================
        // UPDATE EXISTING MESSAGE
        // =========================

        if (
            savedEmbed.messageId &&
            savedEmbed.channelId
        ) {

            try {

                const channel =
                    await interaction.client.channels.fetch(
                        savedEmbed.channelId
                    );


                const message =
                    await channel.messages.fetch(
                        savedEmbed.messageId
                    );


                await message.edit({

                    embeds: [
                        output
                    ]

                });


                const success =
                    new EmbedBuilder()
                        .setColor(
                            config.colors.success
                        )
                        .setDescription(
                            `${config.emojis.success} ${interaction.client.user}: Your embed has been updated.`
                        );


                return interaction.reply({

                    embeds: [
                        success
                    ],

                    flags: 64

                });

            } catch (error) {

                console.error(
                    "[EMBED SAVE] Failed to update embed:",
                    error
                );

                const embed =
                    new EmbedBuilder()
                        .setColor(
                            config.colors.failed
                        )
                        .setDescription(
                            `${config.emojis.failed} ${interaction.client.user}: I couldn't update the original embed message.`
                        );

                return interaction.reply({

                    embeds: [
                        embed
                    ],

                    flags: 64

                });
            }

        }


        // =========================
        // SAVE ONLY
        // =========================

        const success =
            new EmbedBuilder()
                .setColor(
                    config.colors.success
                )
                .setDescription(
                    `${config.emojis.success} ${interaction.client.user}: Your embed has been saved.`
                );


        return interaction.reply({

            embeds: [
                success
            ],

            flags: 64

        });

    }

};
