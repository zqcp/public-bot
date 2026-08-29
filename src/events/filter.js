// src/events/filter.js

const TextFilter =
    require("../systems/TextFilter");

module.exports = {

    name: "messageCreate",

    async execute(
        message,
        client
    ) {

        /*
         * Ignore invalid messages.
         */

        if (
            !message ||
            !message.guild ||
            !message.author ||
            message.author.bot
        ) {
            return;
        }

        /*
         * Make sure the message has content.
         */

        if (
            typeof message.content !== "string" ||
            !message.content.trim()
        ) {
            return;
        }

        /*
         * Run the text filter independently
         * from the normal messageCreate command
         * handler.
         */

        try {

            await TextFilter.handle(
                client,
                message
            );

        } catch (error) {

            console.error(
                "[FILTER EVENT] Text filter error:",
                error
            );

        }

    }

};
