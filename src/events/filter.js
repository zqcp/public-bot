// src/events/filter.js

const TextFilter =
    require("../systems/TextFilter");

module.exports = {

    name: "messageCreate",

    async execute(
        message,
        client
    ) {

        await TextFilter.handle(
            client,
            message
        );

    }

};
