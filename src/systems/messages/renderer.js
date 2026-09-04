const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    StringSelectMenuBuilder,
    UserSelectMenuBuilder,
    RoleSelectMenuBuilder,
    ChannelSelectMenuBuilder,
    MentionableSelectMenuBuilder
} = require("discord.js");

const variables = require("../variables");

module.exports = {

    render(messageData = {}, member = null) {

        const payload = {};

        if (
            messageData.content !== null &&
            messageData.content !== undefined
        ) {
            payload.content = messageData.content;
        }

        if (Array.isArray(messageData.embeds)) {

            payload.embeds = messageData.embeds
                .filter(Boolean)
                .filter(embed =>
                    embed instanceof EmbedBuilder ||
                    Object.keys(embed).length > 0
                )
                .map(embed => {

                    if (embed instanceof EmbedBuilder) {
                        return embed;
                    }

                    const data =
                        JSON.parse(
                            JSON.stringify(embed)
                        );

                    /*
                     * THUMBNAIL
                     */

                    if (data.thumbnail?.url) {

                        if (member) {

                            data.thumbnail.url =
                                variables.replace(
                                    data.thumbnail.url,
                                    member
                                );

                        } else if (
                            data.thumbnail.url.startsWith("{")
                        ) {

                            delete data.thumbnail;

                        }

                    }

                    /*
                     * IMAGE
                     */

                    if (data.image?.url) {

                        if (member) {

                            data.image.url =
                                variables.replace(
                                    data.image.url,
                                    member
                                );

                        } else if (
                            data.image.url.startsWith("{")
                        ) {

                            delete data.image;

                        }

                    }

                    /*
                     * FOOTER
                     */

                    if (data.footer) {

                        if (data.footer.text) {

                            if (member) {

                                data.footer.text =
                                    variables.replace(
                                        data.footer.text,
                                        member
                                    );

                            } else if (
                                data.footer.text.startsWith("{")
                            ) {

                                delete data.footer.text;

                            }

                        }

                        /*
                         * Support both Discord API
                         * format and saved helper format.
                         */

                        if (
                            data.footer.iconURL &&
                            !data.footer.icon_url
                        ) {

                            data.footer.icon_url =
                                data.footer.iconURL;

                            delete data.footer.iconURL;

                        }

                        if (data.footer.icon_url) {

                            if (member) {

                                data.footer.icon_url =
                                    variables.replace(
                                        data.footer.icon_url,
                                        member
                                    );

                            } else if (
                                data.footer.icon_url.startsWith("{")
                            ) {

                                delete data.footer.icon_url;

                            }

                        }

                        if (
                            !data.footer.text &&
                            !data.footer.icon_url
                        ) {

                            delete data.footer;

                        }

                    }

                    return new EmbedBuilder(data);

                });

        }

        if (Array.isArray(messageData.components)) {

            payload.components = messageData.components
                .filter(Boolean)
                .map(component => {

                    if (component instanceof ActionRowBuilder) {
                        return component;
                    }

                    return this.renderComponent(component);

                });

        }

        return payload;

    },

    renderComponent(component = {}) {

        if (component instanceof ActionRowBuilder) {
            return component;
        }

        const row =
            new ActionRowBuilder();

        if (
            !Array.isArray(
                component.components
            )
        ) {
            return row;
        }

        for (const item of component.components) {

            if (!item) {
                continue;
            }

            /*
             * Already a Discord.js builder
             */

            if (
                typeof item.toJSON ===
                "function"
            ) {

                row.addComponents(
                    item
                );

                continue;
            }

            /*
             * Plain saved button
             */

            if (
                item.type === 2
            ) {

                row.addComponents(
                    new ButtonBuilder(
                        item
                    )
                );

                continue;
            }

            /*
             * Plain saved select menu
             */

            if (
                item.type === 3
            ) {

                row.addComponents(
                    new StringSelectMenuBuilder(
                        item
                    )
                );

                continue;
            }

            if (
                item.type === 5
            ) {

                row.addComponents(
                    new UserSelectMenuBuilder(
                        item
                    )
                );

                continue;
            }

            if (
                item.type === 6
            ) {

                row.addComponents(
                    new RoleSelectMenuBuilder(
                        item
                    )
                );

                continue;
            }

            if (
                item.type === 7
            ) {

                row.addComponents(
                    new MentionableSelectMenuBuilder(
                        item
                    )
                );

                continue;
            }

            if (
                item.type === 8
            ) {

                row.addComponents(
                    new ChannelSelectMenuBuilder(
                        item
                    )
                );

                continue;
            }

            /*
             * Fallback for your custom
             * type-based select format.
             */

            row.addComponents(
                this.renderSelect(
                    item
                )
            );

        }

        return row;

    },

    renderSelect(select = {}) {

        if (
            select.type === "role"
        ) {

            return new RoleSelectMenuBuilder(
                select
            );

        }

        if (
            select.type === "user"
        ) {

            return new UserSelectMenuBuilder(
                select
            );

        }

        if (
            select.type === "channel"
        ) {

            return new ChannelSelectMenuBuilder(
                select
            );

        }

        if (
            select.type === "mentionable"
        ) {

            return new MentionableSelectMenuBuilder(
                select
            );

        }

        return new StringSelectMenuBuilder(
            select
        );

    }

};
