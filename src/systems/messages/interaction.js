const renderer = require("./renderer");

module.exports = {

    async reply(interaction, data = {}) {

        if (!interaction) {
            return null;
        }

        const payload = renderer.render(data);

        payload.flags = 64;

        if (
            interaction.replied ||
            interaction.deferred
        ) {

            return interaction.followUp(payload);

        }

        return interaction.reply(payload);

    },

    async update(interaction, data = {}) {

        if (!interaction) {
            return null;
        }

        const payload = renderer.render(data);

        return interaction.update(payload);

    },

    async editReply(interaction, data = {}) {

        if (!interaction) {
            return null;
        }

        const payload = renderer.render(data);

        return interaction.editReply(payload);

    },

    async followUp(interaction, data = {}) {

        if (!interaction) {
            return null;
        }

        const payload = renderer.render(data);

        payload.flags = 64;

        return interaction.followUp(payload);

    },

    async deferReply(interaction) {

        if (!interaction) {
            return null;
        }

        return interaction.deferReply({
            flags: 64
        });

    },

    async deferUpdate(interaction) {

        if (!interaction) {
            return null;
        }

        return interaction.deferUpdate();

    }

};
