const VoiceLevel =
    require("../systems/voiceLevel");

module.exports = {

    name: "voiceStateUpdate",

    async execute(
        oldState,
        newState
    ) {

        const member =
            newState.member ||
            oldState.member;

        if (
            !member ||
            member.user.bot
        ) {
            return;
        }

        const guild =
            newState.guild ||
            oldState.guild;

        if (!guild) {
            return;
        }

        const wasQualified =
            oldState.channelId &&
            !oldState.selfMute &&
            !oldState.serverMute &&
            !oldState.selfDeaf &&
            !oldState.serverDeaf;

        const isQualified =
            newState.channelId &&
            !newState.selfMute &&
            !newState.serverMute &&
            !newState.selfDeaf &&
            !newState.serverDeaf;

        /*
         * USER ENTERED A QUALIFYING
         * VOICE STATE.
         */

        if (
            !wasQualified &&
            isQualified
        ) {

            VoiceLevel.start(
                guild.id,
                member.id
            );

            return;
        }

        /*
         * USER LEFT A QUALIFYING
         * VOICE STATE.
         */

        if (
            wasQualified &&
            !isQualified
        ) {

            await VoiceLevel.stop(
                guild.id,
                member.id
            );

            return;
        }

        /*
         * USER SWITCHED CHANNELS
         * WHILE STILL QUALIFIED.
         *
         * Nothing needs to happen.
         * The same session continues.
         */

    }

};
