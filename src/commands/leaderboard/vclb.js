// src/commands/setup/vclb.js

const {
    EmbedBuilder
} = require("discord.js");

const LeaderboardConfig =
    require("../../models/LeaderboardConfig");

const VoiceLeaderboard =
    require("../../embeds/leaderboard/voice");

const config =
    require("../../config");


module.exports = {

    name: "set vclb",

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
         * Try to reuse the existing message.
         */

        let leaderboardMessage = null;


        if (
            data.voiceChannelId &&
            data.voiceMessageId
        ) {

            const oldChannel =
                message.guild.channels.cache.get(
                    data.voiceChannelId
                );


            if (
                oldChannel &&
                oldChannel.isTextBased()
            ) {

                leaderboardMessage =
                    await oldChannel.messages
                        .fetch(
                            data.voiceMessageId
                        )
                        .catch(
                            () => null
                        );

            }

        }


        /*
         * Use the core Voice Leaderboard embed.
         */

        const embed =
            VoiceLeaderboard.create(
                message.guild,
                [],
                data.nextWipeAt
            );


        /*
         * Edit existing message or create one.
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

        data.voiceChannelId =
            channel.id;

        data.voiceMessageId =
            leaderboardMessage.id;


        await data.save();


        return message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(
                        config.colors.success
                    )
                    .setDescription(
                        `${config.emojis.success} ${message.author}: The **Voice Leaderboard** has been set to ${channel}.`
                    )
            ]
        });

    }

};
