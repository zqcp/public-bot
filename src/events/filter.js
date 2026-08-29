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
         * Run text filter.
         */
        try {
            await TextFilter.handle(
                client,
                message
            );
        } catch (error) {
            console.error(
                "[FILTER EVENT] Failed to process message:",
                error
            );
        }
    }
};
