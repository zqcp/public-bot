// src/commands/misc/banner.js

const {
    EmbedBuilder
} = require("discord.js");

const config =
    require("../../config");

module.exports = {

    name: "banner",

    aliases: ["bn"],

    async execute(
        client,
        message,
        args
    ) {

        let user = null;


        // =========================
        // MENTION
        // =========================

        user =
            message.mentions.users.first();


        // =========================
        // ID / USERNAME
        // =========================

        if (
            !user &&
            args.length
        ) {

            const input =
                args.join(" ").trim();


            // -------------------------
            // USER ID
            // -------------------------

            if (
                /^\d{17,20}$/.test(
                    input
                )
            ) {

                user =
                    await client.users.fetch(
                        input
                    ).catch(
                        () => null
                    );

            }


            // -------------------------
            // USERNAME
            // -------------------------

            if (
                !user
            ) {

                const member =
                    message.guild.members.cache.find(
                        member =>
                            member.user.username
                                .toLowerCase() ===
                            input.toLowerCase()
                    );

                if (
                    member
                ) {

                    user =
                        member.user;

                }

            }


            // -------------------------
            // FETCH GUILD MEMBERS
            // -------------------------

            if (
                !user
            ) {

                const members =
                    await message.guild.members
                        .fetch()
                        .catch(
                            () => null
                        );

                if (
                    members
                ) {

                    const member =
                        members.find(
                            member =>
                                member.user.username
                                    .toLowerCase() ===
                                input.toLowerCase()
                        );

                    if (
                        member
                    ) {

                        user =
                            member.user;

                    }

                }

            }

        }


        // =========================
        // DEFAULT TO AUTHOR
        // =========================

        user =
            user ||
            message.author;


        // =========================
        // FETCH FULL USER
        // =========================

        const fullUser =
            await client.users.fetch(
                user.id,
                {
                    force: true
                }
            ).catch(
                () => user
            );


        // =========================
        // GET BANNER
        // =========================

        const banner =
            fullUser.bannerURL({
                dynamic: true,
                size: 4096
            });


        // =========================
        // NO BANNER
        // =========================

        if (
            !banner
        ) {

            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(
                            config.colors.failed
                        )
                        .setDescription(
                            `${config.emojis.failed} ${fullUser}: You don’t have a banner.`
                        )
                ]
            });

        }


        // =========================
        // BANNER EMBED
        // =========================

        const embed =
            new EmbedBuilder()
                .setColor(
                    config.colors.regular
                )
                .setAuthor({
                    name:
                        fullUser.username,

                    iconURL:
                        fullUser.displayAvatarURL({
                            dynamic: true,
                            size: 4096
                        })
                })
                .setTitle(
                    `${fullUser.username}'s Banner`
                )
                .setImage(
                    banner
                );


        // =========================
        // SEND
        // =========================

        return message.channel.send({
            embeds: [
                embed
            ]
        });

    }

};
