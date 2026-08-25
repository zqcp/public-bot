module.exports = {

    create(data = {}) {

        return {

            name: data.name ?? "",

            value: data.value ?? "",

            inline: data.inline === true

        };

    },

    add(embed, field) {

        if (!embed || !field) {
            return embed;
        }

        if (!Array.isArray(embed.fields)) {
            embed.fields = [];
        }

        embed.fields.push(
            this.create(field)
        );

        return embed;

    },

    edit(embed, index, data = {}) {

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

        const field = embed.fields[index];

        if (data.name !== undefined) {
            field.name = data.name;
        }

        if (data.value !== undefined) {
            field.value = data.value;
        }

        if (data.inline !== undefined) {
            field.inline = data.inline === true;
        }

        return embed;

    },

    remove(embed, index) {

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

        embed.fields.splice(
            index,
            1
        );

        return embed;

    },

    move(embed, from, to) {

        if (
            !embed ||
            !Array.isArray(embed.fields)
        ) {
            return embed;
        }

        if (
            from < 0 ||
            from >= embed.fields.length ||
            to < 0 ||
            to >= embed.fields.length
        ) {
            return embed;
        }

        const field = embed.fields.splice(
            from,
            1
        )[0];

        embed.fields.splice(
            to,
            0,
            field
        );

        return embed;

    },

    clear(embed) {

        if (!embed) {
            return embed;
        }

        embed.fields = [];

        return embed;

    }

};
