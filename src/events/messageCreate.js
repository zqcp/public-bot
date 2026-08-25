const CommandHandler = require("../handlers/commandHandler");

module.exports = {

    name: "messageCreate",

    async execute(message, client) {

        if (message.author.bot) return;


        CommandHandler.handle(
            client,
            message
        );

    }

};
