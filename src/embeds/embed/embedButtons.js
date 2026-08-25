const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

class EmbedButtons {

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
    // BUTTON
    // ==============================

    button(options = {}) {
        if (!this.currentRow) {
            this.row();
        }

        if (
            !options ||
            typeof options !== "object"
        ) {
            return this;
        }

        const button = new ButtonBuilder();

        // Custom ID
        if (options.id) {
            button.setCustomId(
                String(options.id)
            );
        }

        // Label
        if (options.label) {
            button.setLabel(
                String(options.label)
            );
        }

        // Style
        if (options.style !== undefined) {
            const style = this.getStyle(
                options.style
            );

            if (style) {
                button.setStyle(style);
            }
        }

        // Emoji
        if (options.emoji) {
            button.setEmoji(options.emoji);
        }

        // URL
        if (options.url) {
            button.setURL(
                String(options.url)
            );
        }

        // Disabled
        if (options.disabled !== undefined) {
            button.setDisabled(
                Boolean(options.disabled)
            );
        }

        try {
            this.currentRow.addComponents(
                button
            );
        } catch {
            // Ignore invalid buttons.
        }

        return this;
    }

    // ==============================
    // PRIMARY
    // ==============================

    primary(options = {}) {
        return this.button({
            ...options,
            style: ButtonStyle.Primary
        });
    }

    // ==============================
    // SECONDARY
    // ==============================

    secondary(options = {}) {
        return this.button({
            ...options,
            style: ButtonStyle.Secondary
        });
    }

    // ==============================
    // SUCCESS
    // ==============================

    success(options = {}) {
        return this.button({
            ...options,
            style: ButtonStyle.Success
        });
    }

    // ==============================
    // DANGER
    // ==============================

    danger(options = {}) {
        return this.button({
            ...options,
            style: ButtonStyle.Danger
        });
    }

    // ==============================
    // LINK
    // ==============================

    link(options = {}) {
        return this.button({
            ...options,
            style: ButtonStyle.Link
        });
    }

    // ==============================
    // STYLE RESOLVER
    // ==============================

    getStyle(style) {
        if (typeof style === "number") {
            return style;
        }

        if (typeof style !== "string") {
            return null;
        }

        const styles = {
            primary: ButtonStyle.Primary,
            secondary: ButtonStyle.Secondary,
            success: ButtonStyle.Success,
            danger: ButtonStyle.Danger,
            link: ButtonStyle.Link
        };

        return styles[
            style.toLowerCase()
        ] || null;
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

function createButtons() {
    return new EmbedButtons();
}

module.exports = {
    EmbedButtons,
    createButtons
};
