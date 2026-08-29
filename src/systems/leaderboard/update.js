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

const {
    getCycle
} =
    require("./cycle");


async function update(client) {

    let configs;

    try {

        configs =
            await LeaderboardConfig.find({}).lean();

    } catch (error) {

        console.error(
            "[LEADERBOARD] Config error:",
            error
        );

        return;

    }


    for (const data of configs) {

        const guild =
            client.guilds.cache.get(
                data.guildId
            );

        if (!guild) continue;


        /*
         * Make sure the weekly cycle is current.
         * This also handles bot downtime.
         */

        let cycle;

        try {

            cycle =
                await getCycle(
                    guild.id
                );

        } catch (error) {

            console.error(
                `[LEADERBOARD] Cycle error ${guild.id}:`,
                error
            );

            continue;

        }


        if (
            data.chatChannelId &&
            data.chatMessageId
        ) {

            await updateChat(
                guild,
                data,
                cycle
            );

        }


        if (
            data.voiceChannelId &&
            data.voiceMessageId
        ) {

            await updateVoice(
                guild,
                data,
                cycle
            );

        }

    }

}


/*
 * CHAT
 */

async function updateChat(
    guild,
    data,
    cycle
) {

    const channel =
        guild.channels.cache.get(
            data.chatChannelId
        );

    if (
        !channel ||
        !channel.isTextBased()
    ) return;


    const message =
        await channel.messages
            .fetch(data.chatMessageId)
            .catch(() => null);

    if (!message) return;


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
                cycle.nextWipeAt
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
                .catch(() => []);


        await message.edit({
            embeds: [
                FallbackEmbed.chat(
                    guild,
                    saved,
                    cycle.nextWipeAt
                )
            ]
        }).catch(() => null);

    }

}


/*
 * VOICE
 */

async function updateVoice(
    guild,
    data,
    cycle
) {

    const channel =
        guild.channels.cache.get(
            data.voiceChannelId
        );

    if (
        !channel ||
        !channel.isTextBased()
    ) return;


    const message =
        await channel.messages
            .fetch(data.voiceMessageId)
            .catch(() => null);

    if (!message) return;


    try {

        /*
         * Get all users first.
         *
         * Active voice time is added before
         * determining the top 10.
         */

        const records =
            await VoiceLeaderboard
                .find({
                    guildId:
                        guild.id
                })
                .lean();


        const now =
            Date.now();


        const entries =
            records
                .map(record => {

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
                            Number.isFinite(started) &&
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

                })
                .sort(
                    (a, b) =>
                        b.totalSeconds -
                        a.totalSeconds
                )
                .slice(0, 10);


        const embed =
            VoiceEmbed.create(
                guild,
                entries,
                cycle.nextWipeAt
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
                .catch(() => []);


        await message.edit({
            embeds: [
                FallbackEmbed.voice(
                    guild,
                    saved,
                    cycle.nextWipeAt
                )
            ]
        }).catch(() => null);

    }

}


module.exports = {
    update
};
