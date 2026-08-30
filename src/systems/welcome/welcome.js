const Embed = require("../../models/Embed");
const Welcome = require("../../models/Welcome");
const variables = require("../variables");

module.exports = {

    randomColor() {

        return Math.floor(
            Math.random() * 0xFFFFFF
        );

    },

    async build(member) {

        if (!member?.guild) {
            return null;
        }

        const guild =
            member.guild;

        const config =
            await Welcome.findOne({
                guildId: guild.id
            }).lean();

        if (!config) {
            return null;
        }

        if (!config.enabled) {
            return null;
        }

        if (!config.channelId) {
            return null;
        }

        let savedEmbed = null;

        if (config.embedName) {

            savedEmbed =
                await Embed.findOne({
                    guildId: guild.id,
                    name: config.embedName
                }).lean();

        }

        /*
         * FALLBACK
         *
         * The fallback remains completely
         * inside the Welcome system.
         */

        if (
            !savedEmbed ||
            !Array.isArray(savedEmbed.embeds) ||
            !savedEmbed.embeds.length
        ) {

            return {

                channelId:
                    config.channelId,

                payload: {

                    content:
                        variables.replace(
                            "Welcome {user} to **{server}**!",
                            member,
                            {
                                channelId:
                                    config.channelId
                            }
                        )

                }

            };

        }

        /*
         * Clone the saved embed.
         */

        const embed =
            JSON.parse(
                JSON.stringify(
                    savedEmbed.embeds[0]
                )
            );

        /*
         * RANDOM COLOR
         *
         * If the embed doesn't have a
         * color, generate one.
         *
         * If the embed already has a
         * color, keep it.
         */

        if (
            embed.color === undefined ||
            embed.color === null
        ) {

            embed.color =
                this.randomColor();

        }

        /*
         * Variable replacement.
         */

        const replace =
            value =>
                variables.replace(
                    value,
                    member,
                    {
                        channelId:
                            config.channelId
                    }
                );

        /*
         * TITLE
         */

        if (embed.title) {

            embed.title =
                replace(
                    embed.title
                );

        }

        /*
         * DESCRIPTION
         */

        if (embed.description) {

            embed.description =
                replace(
                    embed.description
                );

        }

        /*
         * URL
         */

        if (embed.url) {

            embed.url =
                replace(
                    embed.url
                );

        }

        /*
         * AUTHOR
         */

        if (embed.author) {

            if (embed.author.name) {

                embed.author.name =
                    replace(
                        embed.author.name
                    );

            }

            if (embed.author.url) {

                embed.author.url =
                    replace(
                        embed.author.url
                    );

            }

            if (embed.author.icon_url) {

                embed.author.icon_url =
                    replace(
                        embed.author.icon_url
                    );

            }

        }

        /*
         * FOOTER
         */

        if (embed.footer) {

            if (embed.footer.text) {

                embed.footer.text =
                    replace(
                        embed.footer.text
                    );

            }

            if (embed.footer.icon_url) {

                embed.footer.icon_url =
                    replace(
                        embed.footer.icon_url
                    );

            }

        }

        /*
         * THUMBNAIL
         */

        if (embed.thumbnail?.url) {

            embed.thumbnail.url =
                replace(
                    embed.thumbnail.url
                );

        }

        /*
         * LARGE IMAGE
         */

        if (embed.image?.url) {

            embed.image.url =
                replace(
                    embed.image.url
                );

        }

        /*
         * FIELDS
         */

        if (
            Array.isArray(
                embed.fields
            )
        ) {

            embed.fields =
                embed.fields.map(
                    field => ({

                        ...field,

                        name:
                            replace(
                                field.name
                            ),

                        value:
                            replace(
                                field.value
                            )

                    })
                );

        }

        /*
         * CONTENT ABOVE EMBED
         */

        const content =
            savedEmbed.content
                ? replace(
                    savedEmbed.content
                )
                : null;

        /*
         * FINAL PAYLOAD
         */

        return {

            channelId:
                config.channelId,

            payload: {

                ...(content
                    ? {
                        content
                    }
                    : {}),

                embeds: [
                    embed
                ]

            }

        };

    }

};
