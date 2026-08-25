module.exports = {

    create(value = true) {

        return value;

    },

    set(embed, value = true) {

        if (!embed) {
            return embed;
        }

        embed.timestamp = value;

        return embed;

    },

    remove(embed) {

        if (!embed) {
            return embed;
        }

        embed.timestamp = null;

        return embed;

    },

    now(embed) {

        if (!embed) {
            return embed;
        }

        embed.timestamp = new Date();

        return embed;

    }

};
