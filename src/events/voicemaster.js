const VoiceMaster =
    require("../systems/voicemaster/manager");

module.exports = {

    name: "voiceStateUpdate",

    async execute(
        oldState,
        newState
    ) {

        await VoiceMaster.handle(
            oldState,
            newState
        );

    }

};
