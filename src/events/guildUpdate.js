const Interface =
    require("../systems/voicemaster/interface");

module.exports = {

    name: "guildUpdate",

    async execute(
        oldGuild,
        newGuild
    ) {

        if (
            oldGuild.icon !==
            newGuild.icon
        ) {

            await Interface.update(
                newGuild.client,
                newGuild
            );

        }

    }

};
