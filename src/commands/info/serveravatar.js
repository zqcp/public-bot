// src/commands/general/serveravatar.js

const {
    EmbedBuilder
} = require("discord.js");

const General =
    require("../../embeds/global");

const config =
    require("../../config");

module.exports = {

    name: "serveravatar",

    aliases: ["sav"],

    async execute(
        client,
        message,
        args
    ) {

        /*
         * ====================================================
         * FIND USER
         * ====================================================
         *
         * Supports:
         *
         * ,serveravatar
         * ,serveravatar @user
         * ,serveravatar 123456789012345678
         * ,serveravatar username
         */

        let member =
            message.mentions.members.first();


        /*
         * ID / USERNAME
         */

        if (!member && args.length) {

            const input =
                args.join(" ").trim();


            /*
             * Try member ID first.
             */

            if (
                /^\d{17,20}$/.test(input)
            ) {

                member =
                    message.guild.members.cache.get(
                        input
                    );

                if (!member) {

                    member =
                        await message.guild.members
                            .fetch(input)
                            .catch(() => null);

                }

            }


            /*
             * Try username.
             */

            if (!member) {

                member =
                    message.guild.members.cache.find(
                        m =>
                            m.user.username.toLowerCase() ===
                            input.toLowerCase()
                    );

            }


            /*
             * Try display name.
             */

            if (!member) {

                member =
                    message.guild.members.cache.find(
                        m =>
                            m.displayName.toLowerCase() ===
                            input.toLowerCase()
                    );

            }

        }


        /*
         * ====================================================
         * SELF
         * ====================================================
         */

        member =
            member ||
            message.member;


        /*
         * ====================================================
         * SERVER AVATAR
         * ====================================================
         */

        const avatar =
            member.avatarURL({
                dynamic: true,
                size: 4096
            });


        /*
         * ====================================================
         * NO SERVER AVATAR
         * ====================================================
         */

        if (!avatar) {

            if (
                member.id ===
                message.author.id
            ) {

                return message.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(
                                config.colors.failed
                            )
                            .setDescription(
                                `${config.emojis.failed} ${message.author}: You don’t have a server avatar.`
                            )
                    ]
                });

            }


            return message.channel.send({
                embeds: [
                    General.error(
                        `${config.emojis.failed} ${member}: **${member.user.username}** doesn’t have a server avatar.`
                    )
                ]
            });

        }


        /*
         * ====================================================
         * SERVER AVATAR EMBED
         * ====================================================
         */

        const embed =
            new EmbedBuilder()
                .setColor(
                    config.colors.regular
                )
                .setAuthor({
                    name:
                        member.user.username,

                    iconURL:
                        member.user.displayAvatarURL({
                            dynamic: true,
                            size: 4096
                        })
                })
                .setTitle(
                    `${member.user.username}'s Server Avatar`
                )
                .setImage(
                    avatar
                );


        return message.channel.send({
            embeds: [
                embed
            ]
        });

    }

};
