// src/systems/leaderboard/fallback.js

const ChatLeaderboard =
    require("../../models/ChatLeaderboard");

const VoiceLeaderboard =
    require("../../models/VoiceLeaderboard");

const FallbackEmbed =
    require("../../embeds/leaderboard/fallback");


async function chat(
    guild,
    nextWipeAt
) {

    try {

        const entries =
            await ChatLeaderboard
                .find({
                    guildId: guild.id
                })
                .sort({
                    messages: -1
                })
                .limit(10)
                .lean();

        return FallbackEmbed.chat(
            guild,
            entries,
            nextWipeAt
        );

    } catch (error) {

        console.error(
            "[CHAT LB FALLBACK]",
            error
        );

        return FallbackEmbed.chat(
            guild,
            [],
            nextWipeAt
        );

    }

}


async function voice(
    guild,
    nextWipeAt
) {

    try {

        const entries =
            await VoiceLeaderboard
                .find({
                    guildId: guild.id
                })
                .sort({
                    totalSeconds: -1
                })
                .limit(10)
                .lean();

        return FallbackEmbed.voice(
            guild,
            entries,
            nextWipeAt
        );

    } catch (error) {

        console.error(
            "[VOICE LB FALLBACK]",
            error
        );

        return FallbackEmbed.voice(
            guild,
            [],
            nextWipeAt
        );

    }

}


module.exports = {
    chat,
    voice
};
