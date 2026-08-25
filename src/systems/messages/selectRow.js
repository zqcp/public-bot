const {
    ActionRowBuilder
} = require("discord.js");

const select = require("./select");

module.exports = {

    create() {

        return {
            type: "selectRow",
            select: null
        };

    },

    set(row, data) {

        if (!row || !data) {
            return row;
        }

        row.select = select.create(data);

        return row;

    },

    remove(row) {

        if (!row) {
            return row;
        }

        row.select = null;

        return row;

    },

    build(row) {

        if (
            !row ||
            !row.select
        ) {
            return null;
        }

        const builder = new ActionRowBuilder();

        const builtSelect = select.build(
            row.select
        );

        if (builtSelect) {
            builder.addComponents(
                builtSelect
            );
        }

        return builder;

    }

};
