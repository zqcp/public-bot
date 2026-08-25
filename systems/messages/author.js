module.exports = {

    create(data = {}) {

        return {

            name: data.name ?? null,

            url: data.url ?? null,

            iconURL: data.iconURL ?? null

        };

    },

    setName(author, name) {

        if (!author) {
            return author;
        }

        author.name = name ?? null;

        return author;

    },

    setUrl(author, url) {

        if (!author) {
            return author;
        }

        author.url = url ?? null;

        return author;

    },

    setIcon(author, iconURL) {

        if (!author) {
            return author;
        }

        author.iconURL = iconURL ?? null;

        return author;

    },

    remove(author) {

        return null;

    }

};
