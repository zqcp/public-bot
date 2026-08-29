// src/events/chatLeaderboard.js

const Chat =
    require("../systems/leaderboard/chat");


module.exports = {

    name: "messageCreate",

    async execute(
        client,
        message
    ) {

        if (
            !message.guild ||
            !message.author ||
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
                "[CHAT LEADERBOARD] Event error:",
                error
            );

        }

    }

};
