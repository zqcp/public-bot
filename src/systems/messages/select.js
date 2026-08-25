const {
    StringSelectMenuBuilder,
    RoleSelectMenuBuilder,
    ChannelSelectMenuBuilder,
    UserSelectMenuBuilder,
    MentionableSelectMenuBuilder
} = require("discord.js");

module.exports = {

    create(data = {}) {

        return {

            type: data.type || "string",

            customId: data.customId ?? null,

            placeholder: data.placeholder ?? null,

            minValues:
                data.minValues !== undefined
                    ? data.minValues
                    : 1,

            maxValues:
                data.maxValues !== undefined
                    ? data.maxValues
                    : 1,

            disabled: data.disabled === true,

            options: Array.isArray(data.options)
                ? data.options
                : []

        };

    },

    setType(select, type) {

        if (!select) {
            return select;
        }

        const allowed = [
            "string",
            "role",
            "channel",
            "user",
            "mentionable"
        ];

        if (!allowed.includes(type)) {
            return select;
        }

        select.type = type;

        return select;

    },

    setCustomId(select, customId) {

        if (!select) {
            return select;
        }

        select.customId = customId ?? null;

        return select;

    },

    setPlaceholder(select, placeholder) {

        if (!select) {
            return select;
        }

        select.placeholder = placeholder ?? null;

        return select;

    },

    setMinValues(select, minValues) {

        if (!select) {
            return select;
        }

        select.minValues = minValues;

        return select;

    },

    setMaxValues(select, maxValues) {

        if (!select) {
            return select;
        }

        select.maxValues = maxValues;

        return select;

    },

    setDisabled(select, disabled = true) {

        if (!select) {
            return select;
        }

        select.disabled = disabled === true;

        return select;

    },

    addOption(select, option) {

        if (!select || !option) {
            return select;
        }

        if (!Array.isArray(select.options)) {
            select.options = [];
        }

        if (select.options.length >= 25) {
            return select;
        }

        select.options.push(option);

        return select;

    },

    removeOption(select, index) {

        if (
            !select ||
            !Array.isArray(select.options)
        ) {
            return select;
        }

        if (
            index < 0 ||
            index >= select.options.length
        ) {
            return select;
        }

        select.options.splice(
            index,
            1
        );

        return select;

    },

    clearOptions(select) {

        if (!select) {
            return select;
        }

        select.options = [];

        return select;

    },

    build(select) {

        if (!select) {
            return null;
        }

        let builder;

        if (select.type === "role") {

            builder = new RoleSelectMenuBuilder();

        } else if (select.type === "channel") {

            builder = new ChannelSelectMenuBuilder();

        } else if (select.type === "user") {

            builder = new UserSelectMenuBuilder();

        } else if (select.type === "mentionable") {

            builder = new MentionableSelectMenuBuilder();

        } else {

            builder = new StringSelectMenuBuilder();

        }

        if (select.customId) {
            builder.setCustomId(
                select.customId
            );
        }

        if (select.placeholder) {
            builder.setPlaceholder(
                select.placeholder
            );
        }

        if (select.minValues !== undefined) {
            builder.setMinValues(
                select.minValues
            );
        }

        if (select.maxValues !== undefined) {
            builder.setMaxValues(
                select.maxValues
            );
        }

        builder.setDisabled(
            select.disabled === true
        );

        if (
            select.type === "string" &&
            Array.isArray(select.options) &&
            select.options.length
        ) {

            builder.addOptions(
                select.options
            );

        }

        return builder;

    }

};
