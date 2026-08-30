const Welcome =
    require("../../systems/welcome/welcome");

module.exports = {

    name: "guildMemberAdd",

    async execute(
        client,
        member
    ) {

        if (!member?.guild) {
            return;
        }

        try {

            const result =
                await Welcome.build(
                    member
                );

            if (!result) {
                return;
            }

            const channel =
                await member.guild.channels.fetch(
                    result.channelId
                );

            if (!channel) {
                return;
            }

            if (!channel.isTextBased()) {
                return;
            }

            await channel.send(
                result.payload
            );

        } catch (error) {

            console.error(
                `[WELCOME] ${member.guild.id}:`,
                error
            );

        }

    }

};
