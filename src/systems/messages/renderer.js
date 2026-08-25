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

module.exports = {

    render(messageData = {}) {

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
                .map(embed => {

                    if (embed instanceof EmbedBuilder) {
                        return embed;
                    }

                    return new EmbedBuilder(embed);

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

        const row = new ActionRowBuilder();

        if (!Array.isArray(component.components)) {
            return row;
        }

        for (const item of component.components) {

            if (!item) {
                continue;
            }

            if (
                item.type === 2 ||
                item.data?.type === 2
            ) {
                row.addComponents(item);
                continue;
            }

            if (
                item.type === 3 ||
                item.type === 5 ||
                item.type === 6 ||
                item.type === 7 ||
                item.type === 8 ||
                item.data?.type === 3 ||
                item.data?.type === 5 ||
                item.data?.type === 6 ||
                item.data?.type === 7 ||
                item.data?.type === 8
            ) {
                row.addComponents(item);
                continue;
            }

            row.addComponents(
                this.renderSelect(item)
            );

        }

        return row;

    },

    renderSelect(select = {}) {

        if (select.type === "role") {
            return new RoleSelectMenuBuilder(select);
        }

        if (select.type === "user") {
            return new UserSelectMenuBuilder(select);
        }

        if (select.type === "channel") {
            return new ChannelSelectMenuBuilder(select);
        }

        if (select.type === "mentionable") {
            return new MentionableSelectMenuBuilder(select);
        }

        return new StringSelectMenuBuilder(select);

    }

};
