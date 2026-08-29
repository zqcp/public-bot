// src/events/chatLeaderboard.js

const Chat =
    require("../systems/leaderboard/chat");


module.exports = {

    name: "messageCreate",

    async execute(
        message,
        client
    ) {

        if (
            !message.guild ||
            message.author.bot
        ) {
            return;
        }


        try {

            await Chat.track(
                message
            );

        } catch (error) {

            console.error(
                "[CHAT LEADERBOARD]",
                error
            );

        }

    }

};
