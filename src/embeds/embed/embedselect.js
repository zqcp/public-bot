const {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    UserSelectMenuBuilder,
    RoleSelectMenuBuilder,
    ChannelSelectMenuBuilder,
    MentionableSelectMenuBuilder
} = require("discord.js");

class EmbedSelect {

    constructor() {
        this.rows = [];
        this.currentRow = null;
    }

    // ==============================
    // CREATE NEW ROW
    // ==============================

    row() {
        const row = new ActionRowBuilder();

        this.rows.push(row);
        this.currentRow = row;

        return this;
    }

    // ==============================
    // USE EXISTING ROW
    // ==============================

    useRow(row) {
        if (!(row instanceof ActionRowBuilder)) {
            return this;
        }

        this.rows.push(row);
        this.currentRow = row;

        return this;
    }

    // ==============================
    // STRING SELECT
    // ==============================

    string(options = {}) {
        const menu = new StringSelectMenuBuilder();

        this.configure(menu, options);

        if (Array.isArray(options.options)) {
            const validOptions = options.options
                .filter(option =>
                    option &&
                    option.label &&
                    option.value
                )
                .map(option => {

                    const item = {
                        label: String(option.label),
                        value: String(option.value)
                    };

                    if (option.description) {
                        item.description =
                            String(option.description);
                    }

                    if (option.emoji) {
                        item.emoji = option.emoji;
                    }

                    if (option.default !== undefined) {
                        item.default =
                            Boolean(option.default);
                    }

                    return item;
                });

            if (validOptions.length) {
                menu.addOptions(validOptions);
            }
        }

        return this.add(menu);
    }

    // ==============================
    // ROLE SELECT
    // ==============================

    role(options = {}) {
        const menu = new RoleSelectMenuBuilder();

        this.configure(menu, options);

        return this.add(menu);
    }

    // ==============================
    // USER SELECT
    // ==============================

    user(options = {}) {
        const menu = new UserSelectMenuBuilder();

        this.configure(menu, options);

        return this.add(menu);
    }

    // ==============================
    // CHANNEL SELECT
    // ==============================

    channel(options = {}) {
        const menu = new ChannelSelectMenuBuilder();

        this.configure(menu, options);

        if (Array.isArray(options.channelTypes)) {
            menu.setChannelTypes(
                options.channelTypes
            );
        }

        return this.add(menu);
    }

    // ==============================
    // MENTIONABLE SELECT
    // ==============================

    mentionable(options = {}) {
        const menu =
            new MentionableSelectMenuBuilder();

        this.configure(menu, options);

        return this.add(menu);
    }

    // ==============================
    // COMMON SELECT SETTINGS
    // ==============================

    configure(menu, options = {}) {

        if (
            !options ||
            typeof options !== "object"
        ) {
            return menu;
        }

        if (options.id) {
            menu.setCustomId(
                String(options.id)
            );
        }

        if (options.placeholder) {
            menu.setPlaceholder(
                String(options.placeholder)
            );
        }

        if (options.minValues !== undefined) {
            menu.setMinValues(
                Number(options.minValues)
            );
        }

        if (options.maxValues !== undefined) {
            menu.setMaxValues(
                Number(options.maxValues)
            );
        }

        if (options.disabled !== undefined) {
            menu.setDisabled(
                Boolean(options.disabled)
            );
        }

        return menu;
    }

    // ==============================
    // ADD TO ROW
    // ==============================

    add(menu) {

        if (!menu) {
            return this;
        }

        if (!this.currentRow) {
            this.row();
        }

        try {
            this.currentRow.addComponents(menu);
        } catch {
            // Invalid component ignored safely.
        }

        return this;
    }

    // ==============================
    // NEW ROW
    // ==============================

    newRow() {
        this.currentRow = null;

        return this;
    }

    // ==============================
    // CLEAR
    // ==============================

    clear() {
        this.rows = [];
        this.currentRow = null;

        return this;
    }

    // ==============================
    // BUILD
    // ==============================

    build() {
        return this.rows;
    }
}

function createSelect() {
    return new EmbedSelect();
}

module.exports = {
    EmbedSelect,
    createSelect
};
