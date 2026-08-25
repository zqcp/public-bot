module.exports = {

    create(data = {}) {

        return {

            url: data.url ?? null

        };

    },

    set(thumbnail, url) {

        if (!thumbnail) {
            thumbnail = {};
        }

        thumbnail.url = url ?? null;

        return thumbnail;

    },

    remove() {

        return null;

    }

};
