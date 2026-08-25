const {
    ActionRowBuilder
} = require("discord.js");

const button = require("./button");

module.exports = {

    create() {

        return {
            type: "buttonRow",
            components: []
        };

    },

    add(row, data) {

        if (!row || !data) {
            return row;
        }

        if (!Array.isArray(row.components)) {
            row.components = [];
        }

        if (row.components.length >= 5) {
            return row;
        }

        row.components.push(
            button.create(data)
        );

        return row;

    },

    remove(row, index) {

        if (
            !row ||
            !Array.isArray(row.components)
        ) {
            return row;
        }

        if (
            index < 0 ||
            index >= row.components.length
        ) {
            return row;
        }

        row.components.splice(
            index,
            1
        );

        return row;

    },

    move(row, from, to) {

        if (
            !row ||
            !Array.isArray(row.components)
        ) {
            return row;
        }

        if (
            from < 0 ||
            from >= row.components.length ||
            to < 0 ||
            to >= row.components.length
        ) {
            return row;
        }

        const item = row.components.splice(
            from,
            1
        )[0];

        row.components.splice(
            to,
            0,
            item
        );

        return row;

    },

    clear(row) {

        if (!row) {
            return row;
        }

        row.components = [];

        return row;

    },

    build(row) {

        if (!row) {
            return null;
        }

        const builder = new ActionRowBuilder();

        if (!Array.isArray(row.components)) {
            return builder;
        }

        for (const item of row.components) {

            const built = button.build(item);

            if (built) {
                builder.addComponents(built);
            }

        }

        return builder;

    }

};
