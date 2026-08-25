const {
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = {

    create(data = {}) {

        return {

            customId: data.customId ?? null,

            label: data.label ?? null,

            emoji: data.emoji ?? null,

            style: data.style ?? ButtonStyle.Secondary,

            url: data.url ?? null,

            disabled: data.disabled === true

        };

    },

    setCustomId(button, customId) {

        if (!button) {
            return button;
        }

        button.customId = customId ?? null;

        return button;

    },

    setLabel(button, label) {

        if (!button) {
            return button;
        }

        button.label = label ?? null;

        return button;

    },

    setEmoji(button, emoji) {

        if (!button) {
            return button;
        }

        button.emoji = emoji ?? null;

        return button;

    },

    setStyle(button, style) {

        if (!button) {
            return button;
        }

        button.style = style;

        return button;

    },

    setUrl(button, url) {

        if (!button) {
            return button;
        }

        button.url = url ?? null;

        return button;

    },

    setDisabled(button, disabled = true) {

        if (!button) {
            return button;
        }

        button.disabled = disabled === true;

        return button;

    },

    removeEmoji(button) {

        if (!button) {
            return button;
        }

        button.emoji = null;

        return button;

    },

    build(button) {

        if (!button) {
            return null;
        }

        const builder = new ButtonBuilder();

        if (button.customId) {
            builder.setCustomId(button.customId);
        }

        if (button.label !== null) {
            builder.setLabel(button.label);
        }

        if (button.emoji) {
            builder.setEmoji(button.emoji);
        }

        if (button.url) {
            builder.setURL(button.url);
        }

        if (button.style !== undefined) {
            builder.setStyle(button.style);
        }

        builder.setDisabled(
            button.disabled === true
        );

        return builder;

    }

};
