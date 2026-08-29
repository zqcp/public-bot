// src/events/voiceLeaderboard.js

const Voice =
    require("../systems/leaderboard/voice");


module.exports = {

    name: "voiceStateUpdate",

    async execute(
        client,
        oldState,
        newState
    ) {

        /*
         * Ignore bots
         */

        if (
            !newState.member ||
            newState.member.user.bot
        ) {
            return;
        }


        /*
         * Let the voice leaderboard system
         * handle join / leave / channel changes.
         */

        try {

            await Voice.handle(
                oldState,
                newState
            );

        } catch (error) {

            console.error(
                "[VOICE LEADERBOARD] Event error:",
                error
            );

        }

    }

};
