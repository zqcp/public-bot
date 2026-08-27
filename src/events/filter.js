// src/events/filter.js

const CommandHandler =
    require("../handlers/commandHandler");

const TextFilter =
    require("../systems/TextFilter");

module.exports = {

    name: "messageCreate",

    async execute(
        client,
        message
    ) {

        /*
         * Text filter
         */

        const filtered =
            await TextFilter.handle(
                client,
                message
            );

        /*
         * Message was filtered
         */

        if (filtered) {
            return;
        }

        /*
         * Command handler
         */

        await CommandHandler.handle(
            client,
            message
        );

    }

};
