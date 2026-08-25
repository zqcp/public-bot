module.exports = {

    create(data = {}) {

        return {

            label: data.label ?? "",

            value: data.value ?? "",

            description: data.description ?? null,

            emoji: data.emoji ?? null,

            default: data.default === true

        };

    },

    setLabel(option, label) {

        if (!option) {
            return option;
        }

        option.label = label ?? "";

        return option;

    },

    setValue(option, value) {

        if (!option) {
            return option;
        }

        option.value = value ?? "";

        return option;

    },

    setDescription(option, description) {

        if (!option) {
            return option;
        }

        option.description = description ?? null;

        return option;

    },

    setEmoji(option, emoji) {

        if (!option) {
            return option;
        }

        option.emoji = emoji ?? null;

        return option;

    },

    setDefault(option, value = true) {

        if (!option) {
            return option;
        }

        option.default = value === true;

        return option;

    },

    removeEmoji(option) {

        if (!option) {
            return option;
        }

        option.emoji = null;

        return option;

    }

};
