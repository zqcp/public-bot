// src/commands/leaderboard/setchatlb.js

const {
    EmbedBuilder
} = require("discord.js");

const LeaderboardConfig =
    require("../../models/LeaderboardConfig");

const config =
    require("../../config");


module.exports = {

    name: "set chatlb",

    aliases: [],

    async execute(
        client,
        message,
        args
    ) {

        if (
            !message.member.permissions.has(
                "ManageGuild"
            )
        ) {

            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(
                            config.colors.failed
                        )
                        .setDescription(
                            `${config.emojis.failed} ${message.author}: You need the **Manage Server** permission to use this command.`
                        )
                ]
            });

        }


        const channel =
            message.mentions.channels.first() ||
            message.guild.channels.cache.get(
                args[0]
            );


        if (
            !channel ||
            !channel.isTextBased()
        ) {

            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(
                            config.colors.failed
                        )
                        .setDescription(
                            `${config.emojis.failed} ${message.author}: Please provide a valid **text channel**.`
                        )
                ]
            });

        }


        let data =
            await LeaderboardConfig.findOne({
                guildId:
                    message.guild.id
            });


        if (!data) {

            const now =
                new Date();


            data =
                await LeaderboardConfig.create({

                    guildId:
                        message.guild.id,

                    chatChannelId:
                        channel.id,

                    weekStartedAt:
                        now,

                    nextWipeAt:
                        new Date(
                            now.getTime() +
                            7 * 24 * 60 * 60 * 1000
                        )

                });

        } else {

            data.chatChannelId =
                channel.id;

            await data.save();

        }


        const embed =
            new EmbedBuilder()
                .setColor(
                    config.colors.success
                )
                .setDescription(
                    `${config.emojis.success} ${message.author}: The **Chat Leaderboard** will now be posted in ${channel}.`
                );


        return message.channel.send({
            embeds: [
                embed
            ]
        });

    }

};
