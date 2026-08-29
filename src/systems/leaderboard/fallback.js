// src/systems/leaderboard/fallback.js

const ChatLeaderboard =
    require("../../models/ChatLeaderboard");

const VoiceLeaderboard =
    require("../../models/VoiceLeaderboard");

const FallbackEmbed =
    require("../../embeds/leaderboard/fallback");


async function chat(
    guild,
    message,
    nextWipeAt
) {

    if (
        !guild ||
        !message
    ) {
        return false;
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
            FallbackEmbed.chat(
                guild,
                entries,
                nextWipeAt
            );


        await message.edit({
            embeds: [embed]
        });


        return true;

    } catch (error) {

        console.error(
            `[LEADERBOARD FALLBACK] Chat ${guild.id}:`,
            error
        );

        return false;

    }

}


async function voice(
    guild,
    message,
    nextWipeAt
) {

    if (
        !guild ||
        !message
    ) {
        return false;
    }


    try {

        const entries =
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


        const embed =
            FallbackEmbed.voice(
                guild,
                entries,
                nextWipeAt
            );


        await message.edit({
            embeds: [embed]
        });


        return true;

    } catch (error) {

        console.error(
            `[LEADERBOARD FALLBACK] Voice ${guild.id}:`,
            error
        );

        return false;

    }

}


module.exports = {

    chat,

    voice

};
