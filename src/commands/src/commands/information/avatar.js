const {
    EmbedBuilder
} = require("discord.js");

const config =
    require("../../config");

module.exports = {

    name: "avatar",

    aliases: ["av"],

    async execute(
        client,
        message,
        args
    ) {

        let user =
            message.mentions.users.first();

        if (!user && args[0]) {

            const input =
                args.join(" ").trim();

            user =
                message.guild.members.cache.find(
                    member =>
                        member.user.username.toLowerCase() ===
                        input.toLowerCase()
                )?.user;

            if (!user) {

                user =
                    await client.users.fetch(
                        input
                    ).catch(() => null);

            }

        }

        user =
            user ||
            message.author;

        const avatar =
            user.displayAvatarURL({
                dynamic: true,
                size: 4096
            });

        const embed =
            new EmbedBuilder()
                .setColor(config.colors.regular)
                .setTitle(`${user.username}'s Avatar`)
                .setImage(avatar);

        return message.channel.send({
            embeds: [embed]
        });

    }

};
