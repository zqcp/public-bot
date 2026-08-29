module.exports = {

    name: "vc",

    aliases: [],

    async execute(
        client,
        message,
        args
    ) {

        return message.channel.send(
            "Use subcommands like, `vc lock`, `vc unlock`, `vc permit @user`, `vc reject @user`, `vc kick @user`, `vc limit <number>`, `vc rename`, `vc transfer @user`, `vc claim`, `vc unmute`, `vc hide`, `vc reveal`."
        );

    }

};
