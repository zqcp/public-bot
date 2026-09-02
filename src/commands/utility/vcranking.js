// src/commands/utility/vcranking.js

const {
    PermissionFlagsBits
} = require("discord.js");

const voiceLevel =
    require("../../events/voiceLevel");

const globalEmbeds =
    require("../../embeds/global");

const config =
    require("../../config");


module.exports = {

    name: "test vc level",

    aliases: [],

    async execute(
        client,
        message,
        args
    ) {

        if (
            !message.member.permissions.has(
                PermissionFlagsBits.Administrator
            )
        ) {

            return message.channel.send({
                embeds: [
                    globalEmbeds.permission(
                        message.author,
                        "Administrator"
                    )
                ]
            });

        }


        const level =
            Number(args[0]) || 1;

        const roleName =
            args
                .slice(1)
                .join(" ") ||
            null;


        return message.reply({
            embeds: [
                voiceLevel.levelUp(
                    message.author,
                    level,
                    roleName
                )
            ]
        });

    }

};
