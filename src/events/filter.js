// src/events/filter.js

const TextFilter =
    require("../systems/TextFilter");

module.exports = {

    name: "messageCreate",

    async execute(
        client,
        message
    ) {

        await TextFilter.handle(
            client,
            message
        );

    }

};
