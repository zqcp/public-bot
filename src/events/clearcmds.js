// src/events/clearcmds.js

const ClearCmds =
    require("../systems/clearCmds");

module.exports = {

    name: "messageCreate",

    async execute(
        message,
        client
    ) {

        await ClearCmds.handle(
            client,
            message
        );

    }

};
