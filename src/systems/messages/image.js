module.exports = {

    create(data = {}) {

        return {

            url: data.url ?? null

        };

    },

    set(image, url) {

        if (!image) {
            image = {};
        }

        image.url = url ?? null;

        return image;

    },

    remove() {

        return null;

    }

};
