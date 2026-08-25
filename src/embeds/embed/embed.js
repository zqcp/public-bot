const { EmbedBuilder } = require("discord.js");
const config = require("../../config");

class Embed {

    constructor(options = {}) {
        this.embed = new EmbedBuilder();

        if (options.title) {
            this.title(options.title);
        }

        if (options.description) {
            this.description(options.description);
        }

        if (options.color !== undefined) {
            this.color(options.color);
        }

        if (options.url) {
            this.url(options.url);
        }

        if (options.author) {
            this.author(options.author);
        }

        if (options.footer) {
            this.footer(options.footer);
        }

        if (options.thumbnail) {
            this.thumbnail(options.thumbnail);
        }

        if (options.image) {
            this.image(options.image);
        }

        if (options.timestamp) {
            this.timestamp(options.timestamp);
        }

        if (Array.isArray(options.fields)) {
            this.fields(options.fields);
        }
    }

    title(value) {
        if (typeof value !== "string" || !value.trim()) {
            return this;
        }

        this.embed.setTitle(value);
        return this;
    }

    description(value) {
        if (typeof value !== "string" || !value.trim()) {
            return this;
        }

        this.embed.setDescription(value);
        return this;
    }

    color(value) {
        if (typeof value === "string") {
            value = config.colors?.[value];
        }

        if (value === undefined || value === null) {
            return this;
        }

        try {
            this.embed.setColor(value);
        } catch {
            // Ignore invalid colors.
        }

        return this;
    }

    url(value) {
        if (typeof value !== "string" || !value.trim()) {
            return this;
        }

        this.embed.setURL(value);
        return this;
    }

    author(options = {}) {
        if (!options || typeof options !== "object") {
            return this;
        }

        if (
            typeof options.name !== "string" ||
            !options.name.trim()
        ) {
            return this;
        }

        const author = {
            name: options.name
        };

        if (options.iconURL) {
            author.iconURL = options.iconURL;
        }

        if (options.url) {
            author.url = options.url;
        }

        try {
            this.embed.setAuthor(author);
        } catch {
            // Ignore invalid author data.
        }

        return this;
    }

    footer(options = {}) {
        if (!options || typeof options !== "object") {
            return this;
        }

        if (
            typeof options.text !== "string" ||
            !options.text.trim()
        ) {
            return this;
        }

        const footer = {
            text: options.text
        };

        if (options.iconURL) {
            footer.iconURL = options.iconURL;
        }

        try {
            this.embed.setFooter(footer);
        } catch {
            // Ignore invalid footer data.
        }

        return this;
    }

    thumbnail(value) {
        if (typeof value !== "string" || !value.trim()) {
            return this;
        }

        try {
            this.embed.setThumbnail(value);
        } catch {
            // Ignore invalid thumbnail.
        }

        return this;
    }

    image(value) {
        if (typeof value !== "string" || !value.trim()) {
            return this;
        }

        try {
            this.embed.setImage(value);
        } catch {
            // Ignore invalid image.
        }

        return this;
    }

    timestamp(value = Date.now()) {
        try {
            this.embed.setTimestamp(value);
        } catch {
            this.embed.setTimestamp();
        }

        return this;
    }

    field(name, value, inline = false) {
        if (
            typeof name !== "string" ||
            !name.trim()
        ) {
            return this;
        }

        if (
            typeof value !== "string" ||
            !value.trim()
        ) {
            return this;
        }

        try {
            this.embed.addFields({
                name,
                value,
                inline: Boolean(inline)
            });
        } catch {
            // Ignore invalid fields.
        }

        return this;
    }

    fields(fields = []) {
        if (!Array.isArray(fields)) {
            return this;
        }

        for (const field of fields) {
            if (!field || typeof field !== "object") {
                continue;
            }

            this.field(
                field.name,
                field.value,
                field.inline
            );
        }

        return this;
    }

    inlineField(name, value) {
        return this.field(name, value, true);
    }

    clearFields() {
        const fields = this.embed.data.fields || [];

        if (fields.length) {
            this.embed.spliceFields(0, fields.length);
        }

        return this;
    }

    build() {
        return this.embed;
    }

    toJSON() {
        return this.embed.toJSON();
    }
}

function createEmbed(options = {}) {
    return new Embed(options);
}

module.exports = {
    Embed,
    createEmbed
};
