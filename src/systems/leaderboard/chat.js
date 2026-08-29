const ChatLeaderboard =
    require("../../models/ChatLeaderboard");

async function track(message) {

    if (
        !message?.guild ||
        message.author.bot
    ) return;

    try {

        await ChatLeaderboard.findOneAndUpdate(
            {
                guildId: message.guild.id,
                userId: message.author.id
            },
            {
                $inc: {
                    messages: 1
                }
            },
            {
                upsert: true,
                setDefaultsOnInsert: true
            }
        );

    } catch (error) {

        console.error(
            "[CHAT LB]",
            error
        );

    }

}


async function getTop(
    guildId,
    limit = 10
) {

    if (!guildId) return [];

    try {

        return await ChatLeaderboard
            .find({ guildId })
            .sort({
                messages: -1,
                userId: 1
            })
            .limit(limit)
            .lean();

    } catch (error) {

        console.error(
            "[CHAT LB]",
            error
        );

        return [];

    }

}


async function reset(guildId) {

    if (!guildId) return false;

    try {

        await ChatLeaderboard.deleteMany({
            guildId
        });

        return true;

    } catch (error) {

        console.error(
            "[CHAT LB]",
            error
        );

        return false;

    }

}


module.exports = {
    track,
    getTop,
    reset
};
