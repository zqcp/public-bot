// src/events/voiceLeaderboard.js

const Voice =
    require("../systems/leaderboard/voice");


module.exports = {

    name: "voiceStateUpdate",

    async execute(
        oldState,
        newState,
        client
    ) {

        if (
            !newState?.member ||
            newState.member.user.bot
        ) {
            return;
        }


        try {

            await Voice.handle(
                oldState,
                newState
            );

        } catch (error) {

            console.error(
                "[VOICE LEADERBOARD]",
                error
            );

        }

    }

};
