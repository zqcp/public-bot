const {
    EmbedBuilder
} = require("discord.js");

const config =
    require("../../config");

module.exports = {

    name: "banner",

    aliases: [],

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


        /*
         * SELF
         */

        if (!user) {

            user =
                await client.users.fetch(
                    message.author.id,
                    {
                        force: true
                    }
                );

        }


        const fullUser =
            await client.users.fetch(
                user.id,
                {
                    force: true
                }
            );

        const banner =
            fullUser.bannerURL({
                dynamic: true,
                size: 4096
            });


        /*
         * NO BANNER
         */

        if (!banner) {

            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(config.colors.failed)
                        .setDescription(
                            `${config.emojis.failed} ${fullUser}: You don’t have a banner.`
                        )
                ]
            });

        }


        /*
         * BANNER EMBED
         */

        const embed =
            new EmbedBuilder()
                .setColor(config.colors.regular)
                .setAuthor({
                    name: fullUser.username,
                    iconURL: fullUser.displayAvatarURL({
                        dynamic: true,
                        size: 4096
                    })
                })
                .setTitle(`${fullUser.username}'s Banner`)
                .setImage(banner);

        return message.channel.send({
            embeds: [embed]
        });

    }

};
