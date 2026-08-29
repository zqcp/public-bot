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
            !message.member.permissions.has("ManageGuild")
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


        const now =
            new Date();


        if (!data) {

            data =
                new LeaderboardConfig({
                    guildId:
                        message.guild.id,

                    weekStartedAt:
                        now,

                    nextWipeAt:
                        new Date(
                            now.getTime() +
                            7 * 24 * 60 * 60 * 1000
                        )
                });

        }


        /*
         * If an old leaderboard message exists,
         * edit it instead of creating another one.
         */

        let leaderboardMessage = null;


        if (
            data.chatChannelId &&
            data.chatMessageId
        ) {

            const oldChannel =
                message.guild.channels.cache.get(
                    data.chatChannelId
                );


            if (
                oldChannel &&
                oldChannel.isTextBased()
            ) {

                leaderboardMessage =
                    await oldChannel.messages.fetch(
                        data.chatMessageId
                    ).catch(
                        () => null
                    );

            }

        }


        /*
         * Create the leaderboard embed.
         */

        const embed =
            new EmbedBuilder()
                .setColor(
                    config.colors.regular
                )
                .setTitle(
                    "💬 Chat Leaderboard"
                )
                .setAuthor({
                    name:
                        message.guild.name
                })
                .setDescription(
                    "No messages yet."
                )
                .setFooter({
                    text:
                        "Updates every min"
                });


        const icon =
            message.guild.iconURL({
                dynamic: true,
                size: 4096
            });


        if (icon) {

            embed.setThumbnail(
                icon
            );

        }


        /*
         * Edit existing message if possible.
         */

        if (
            leaderboardMessage
        ) {

            await leaderboardMessage.edit({
                embeds: [
                    embed
                ]
            });

        } else {

            leaderboardMessage =
                await channel.send({
                    embeds: [
                        embed
                    ]
                });

        }


        /*
         * Save configuration.
         */

        data.chatChannelId =
            channel.id;

        data.chatMessageId =
            leaderboardMessage.id;


        await data.save();


        return message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(
                        config.colors.success
                    )
                    .setDescription(
                        `${config.emojis.success} ${message.author}: The **Chat Leaderboard** has been set to ${channel}.`
                    )
            ]
        });

    }

};
