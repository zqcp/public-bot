// src/commands/misc/avatar.js

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
            // FETCH USERNAME
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
        // DEFAULT USER
        // =========================

        user =
            user ||
            message.author;


        // =========================
        // AVATAR
        // =========================

        const avatar =
            user.displayAvatarURL({
                dynamic: true,
                size: 4096
            });


        // =========================
        // EMBED
        // =========================

        const embed =
            new EmbedBuilder()
                .setColor(
                    config.colors.regular
                )
                .setTitle(
                    `${user.username}'s Avatar`
                )
                .setImage(
                    avatar
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
