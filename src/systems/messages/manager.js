const message = require("./message");

module.exports = {

    create(data = {}) {

        return message.create(data);

    },

    setContent(data, content) {

        return message.setContent(
            data,
            content
        );

    },

    addEmbed(data, embed) {

        return message.addEmbed(
            data,
            embed
        );

    },

    removeEmbed(data, index) {

        return message.removeEmbed(
            data,
            index
        );

    },

    addComponent(data, component) {

        return message.addComponent(
            data,
            component
        );

    },

    removeComponent(data, index) {

        return message.removeComponent(
            data,
            index
        );

    }

};
