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

const Fallback =
    require("../../embeds/leaderboard/fallback");


async function update(client) {

    const configs =
        await LeaderboardConfig
            .find({})
            .lean()
            .catch(() => []);

    for (const data of configs) {

        const guild =
            client.guilds.cache.get(
                data.guildId
            );

        if (!guild) continue;

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


async function getMessage(
    guild,
    channelId,
    messageId
) {

    const channel =
        guild.channels.cache.get(
            channelId
        );

    if (
        !channel ||
        !channel.isTextBased()
    ) return null;

    return channel.messages
        .fetch(messageId)
        .catch(() => null);

}


async function updateChat(
    guild,
    data
) {

    const message =
        await getMessage(
            guild,
            data.chatChannelId,
            data.chatMessageId
        );

    if (!message) return;

    try {

        const entries =
            await ChatLeaderboard
                .find({
                    guildId: guild.id
                })
                .sort({
                    messages: -1,
                    userId: 1
                })
                .limit(10)
                .lean();

        await message.edit({
            embeds: [
                ChatEmbed.create(
                    guild,
                    entries,
                    data.nextWipeAt
                )
            ]
        });

    } catch (error) {

        console.error(
            "[CHAT LB UPDATE]",
            error
        );

        await message.edit({
            embeds: [
                Fallback.chat(
                    guild,
                    [],
                    data.nextWipeAt
                )
            ]
        }).catch(() => null);

    }

}


async function updateVoice(
    guild,
    data
) {

    const message =
        await getMessage(
            guild,
            data.voiceChannelId,
            data.voiceMessageId
        );

    if (!message) return;

    try {

        const entries =
            await VoiceLeaderboard
                .find({
                    guildId: guild.id
                })
                .sort({
                    totalSeconds: -1,
                    userId: 1
                })
                .limit(10)
                .lean();

        const now = Date.now();

        for (const entry of entries) {

            if (!entry.sessionStartedAt)
                continue;

            const started =
                new Date(
                    entry.sessionStartedAt
                ).getTime();

            if (started <= now) {

                entry.totalSeconds +=
                    Math.floor(
                        (now - started) / 1000
                    );

            }

        }

        entries.sort(
            (a, b) =>
                b.totalSeconds -
                a.totalSeconds
        );

        await message.edit({
            embeds: [
                VoiceEmbed.create(
                    guild,
                    entries,
                    data.nextWipeAt
                )
            ]
        });

    } catch (error) {

        console.error(
            "[VOICE LB UPDATE]",
            error
        );

        await message.edit({
            embeds: [
                Fallback.voice(
                    guild,
                    [],
                    data.nextWipeAt
                )
            ]
        }).catch(() => null);

    }

}


module.exports = {
    update
};
