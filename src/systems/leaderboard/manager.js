// src/systems/leaderboard/update.js

const LeaderboardConfig =
    require("../../models/LeaderboardConfig");

const ChatLeaderboard =
    require("../../models/ChatLeaderboard");

const VoiceLeaderboard =
    require("../../models/VoiceLeaderboard");

const ChatEmbed =
    require("../../embeds/leaderboard/chat");

const VoiceEmbed =
    require("../../embeds/leaderboard/voice");

const FallbackEmbed =
    require("../../embeds/leaderboard/fallback");


async function update(client) {

    let configs;

    try {

        configs =
            await LeaderboardConfig
                .find({})
                .lean();

    } catch (error) {

        console.error(
            "[LEADERBOARD] Failed to load configs:",
            error
        );

        return;

    }


    for (
        const data of configs
    ) {

        const guild =
            client.guilds.cache.get(
                data.guildId
            );


        if (!guild) {
            continue;
        }


        if (
            data.chatChannelId &&
            data.chatMessageId
        ) {

            await updateChat(
                guild,
                data
            );

        }


        if (
            data.voiceChannelId &&
            data.voiceMessageId
        ) {

            await updateVoice(
                guild,
                data
            );

        }

    }

}


async function updateChat(
    guild,
    data
) {

    const channel =
        guild.channels.cache.get(
            data.chatChannelId
        );


    if (
        !channel ||
        !channel.isTextBased()
    ) {
        return;
    }


    const message =
        await channel.messages
            .fetch(
                data.chatMessageId
            )
            .catch(
                () => null
            );


    if (!message) {
        return;
    }


    try {

        const entries =
            await ChatLeaderboard
                .find({
                    guildId:
                        guild.id
                })
                .sort({
                    messages: -1,
                    userId: 1
                })
                .limit(10)
                .lean();


        const embed =
            ChatEmbed.create(
                guild,
                entries,
                data.nextWipeAt
            );


        await message.edit({
            embeds: [embed]
        });

    } catch (error) {

        console.error(
            `[LEADERBOARD CHAT] ${guild.id}:`,
            error
        );


        const saved =
            await ChatLeaderboard
                .find({
                    guildId:
                        guild.id
                })
                .sort({
                    messages: -1
                })
                .limit(10)
                .lean()
                .catch(
                    () => []
                );


        const embed =
            FallbackEmbed.chat(
                guild,
                saved,
                data.nextWipeAt
            );


        await message.edit({
            embeds: [embed]
        }).catch(
            () => null
        );

    }

}


async function updateVoice(
    guild,
    data
) {

    const channel =
        guild.channels.cache.get(
            data.voiceChannelId
        );


    if (
        !channel ||
        !channel.isTextBased()
    ) {
        return;
    }


    const message =
        await channel.messages
            .fetch(
                data.voiceMessageId
            )
            .catch(
                () => null
            );


    if (!message) {
        return;
    }


    try {

        const records =
            await VoiceLeaderboard
                .find({
                    guildId:
                        guild.id
                })
                .sort({
                    totalSeconds: -1,
                    userId: 1
                })
                .limit(10)
                .lean();


        const now =
            Date.now();


        /*
         * Add currently active voice time
         * for display without changing MongoDB.
         */

        const entries =
            records.map(
                record => {

                    let seconds =
                        Number(
                            record.totalSeconds || 0
                        );


                    if (
                        record.sessionStartedAt
                    ) {

                        const started =
                            new Date(
                                record.sessionStartedAt
                            ).getTime();


                        if (
                            Number.isFinite(
                                started
                            ) &&
                            started <= now
                        ) {

                            seconds +=
                                Math.floor(
                                    (
                                        now -
                                        started
                                    ) / 1000
                                );

                        }

                    }


                    return {
                        ...record,
                        totalSeconds:
                            seconds
                    };

                }
            )
            .sort(
                (a, b) =>
                    b.totalSeconds -
                    a.totalSeconds
            );


        const embed =
            VoiceEmbed.create(
                guild,
                entries,
                data.nextWipeAt
            );


        await message.edit({
            embeds: [embed]
        });

    } catch (error) {

        console.error(
            `[LEADERBOARD VOICE] ${guild.id}:`,
            error
        );


        const saved =
            await VoiceLeaderboard
                .find({
                    guildId:
                        guild.id
                })
                .sort({
                    totalSeconds: -1
                })
                .limit(10)
                .lean()
                .catch(
                    () => []
                );


        const embed =
            FallbackEmbed.voice(
                guild,
                saved,
                data.nextWipeAt
            );


        await message.edit({
            embeds: [embed]
        }).catch(
            () => null
        );

    }

}


module.exports = {
    update
};
