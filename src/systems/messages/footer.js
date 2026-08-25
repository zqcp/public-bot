module.exports = {

    create(data = {}) {

        return {

            text: data.text ?? null,

            iconURL: data.iconURL ?? null

        };

    },

    setText(footer, text) {

        if (!footer) {
            return footer;
        }

        footer.text = text ?? null;

        return footer;

    },

    setIcon(footer, iconURL) {

        if (!footer) {
            return footer;
        }

        footer.iconURL = iconURL ?? null;

        return footer;

    },

    remove(footer) {

        return null;

    }

};
