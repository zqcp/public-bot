const {
    EmbedBuilder
} = require("discord.js");

module.exports = {

    create(data = {}) {

        return {

            title: data.title ?? null,

            description: data.description ?? null,

            url: data.url ?? null,

            color: data.color ?? null,

            author: data.author ?? null,

            footer: data.footer ?? null,

            fields: Array.isArray(data.fields)
                ? data.fields
                : [],

            thumbnail: data.thumbnail ?? null,

            image: data.image ?? null,

            timestamp: data.timestamp ?? null

        };

    },

    setTitle(embed, title) {

        if (!embed) {
            return embed;
        }

        embed.title = title ?? null;

        return embed;

    },

    setDescription(embed, description) {

        if (!embed) {
            return embed;
        }

        embed.description = description ?? null;

        return embed;

    },

    setUrl(embed, url) {

        if (!embed) {
            return embed;
        }

        embed.url = url ?? null;

        return embed;

    },

    setColor(embed, color) {

        if (!embed) {
            return embed;
        }

        embed.color = color ?? null;

        return embed;

    },

    setAuthor(embed, author) {

        if (!embed) {
            return embed;
        }

        embed.author = author ?? null;

        return embed;

    },

    setFooter(embed, footer) {

        if (!embed) {
            return embed;
        }

        embed.footer = footer ?? null;

        return embed;

    },

    addField(embed, field) {

        if (!embed || !field) {
            return embed;
        }

        if (!Array.isArray(embed.fields)) {
            embed.fields = [];
        }

        embed.fields.push(field);

        return embed;

    },

    removeField(embed, index) {

        if (
            !embed ||
            !Array.isArray(embed.fields)
        ) {
            return embed;
        }

        if (
            index < 0 ||
            index >= embed.fields.length
        ) {
            return embed;
        }

        embed.fields.splice(index, 1);

        return embed;

    },

    setThumbnail(embed, thumbnail) {

        if (!embed) {
            return embed;
        }

        embed.thumbnail = thumbnail ?? null;

        return embed;

    },

    setImage(embed, image) {

        if (!embed) {
            return embed;
        }

        embed.image = image ?? null;

        return embed;

    },

    setTimestamp(embed, timestamp = true) {

        if (!embed) {
            return embed;
        }

        embed.timestamp = timestamp;

        return embed;

    },

    removeTimestamp(embed) {

        if (!embed) {
            return embed;
        }

        embed.timestamp = null;

        return embed;

    }

};
