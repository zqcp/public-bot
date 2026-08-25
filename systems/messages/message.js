module.exports = {

    create(data = {}) {

        return {
            content: data.content ?? null,

            embeds: Array.isArray(data.embeds)
                ? data.embeds
                : [],

            components: Array.isArray(data.components)
                ? data.components
                : []
        };

    },

    setContent(message, content) {

        if (!message) {
            return message;
        }

        message.content = content ?? null;

        return message;

    },

    addEmbed(message, embed) {

        if (!message || !embed) {
            return message;
        }

        if (!Array.isArray(message.embeds)) {
            message.embeds = [];
        }

        message.embeds.push(embed);

        return message;

    },

    removeEmbed(message, index) {

        if (
            !message ||
            !Array.isArray(message.embeds)
        ) {
            return message;
        }

        if (
            index < 0 ||
            index >= message.embeds.length
        ) {
            return message;
        }

        message.embeds.splice(index, 1);

        return message;

    },

    addComponent(message, component) {

        if (!message || !component) {
            return message;
        }

        if (!Array.isArray(message.components)) {
            message.components = [];
        }

        message.components.push(component);

        return message;

    },

    removeComponent(message, index) {

        if (
            !message ||
            !Array.isArray(message.components)
        ) {
            return message;
        }

        if (
            index < 0 ||
            index >= message.components.length
        ) {
            return message;
        }

        message.components.splice(index, 1);

        return message;

    }

};
