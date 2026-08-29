// src/systems/leaderboard/chat.js

const ChatLeaderboard =
    require("../../models/ChatLeaderboard");


async function track(
    message
) {

    if (
        !message?.guild ||
        !message.author ||
        message.author.bot
    ) {
        return false;
    }


    try {

        await ChatLeaderboard.updateOne(
            {
                guildId:
                    message.guild.id,

                userId:
                    message.author.id
            },
            {
                $inc: {
                    messages: 1
                }
            },
            {
                upsert: true
            }
        );


        return true;

    } catch (error) {

        console.error(
            "[LEADERBOARD CHAT] Track error:",
            error
        );

        return false;

    }

}


async function getTop(
    guildId,
    limit = 10
) {

    if (!guildId) {
        return [];
    }


    try {

        const safeLimit =
            Math.min(
                Math.max(
                    Number(limit) || 10,
                    1
                ),
                100
            );


        return await ChatLeaderboard
            .find({
                guildId
            })
            .sort({
                messages: -1,
                userId: 1
            })
            .limit(
                safeLimit
            )
            .lean();

    } catch (error) {

        console.error(
            "[LEADERBOARD CHAT] Get top error:",
            error
        );

        return [];

    }

}


async function getRank(
    guildId,
    userId
) {

    if (
        !guildId ||
        !userId
    ) {
        return null;
    }


    try {

        const user =
            await ChatLeaderboard
                .findOne({
                    guildId,
                    userId
                })
                .lean();


        if (!user) {
            return null;
        }


        const above =
            await ChatLeaderboard.countDocuments({
                guildId,

                messages: {
                    $gt:
                        user.messages
                }
            });


        return {
            rank:
                above + 1,

            messages:
                user.messages || 0
        };

    } catch (error) {

        console.error(
            "[LEADERBOARD CHAT] Rank error:",
            error
        );

        return null;

    }

}


async function reset(
    guildId
) {

    if (!guildId) {
        return false;
    }


    try {

        await ChatLeaderboard.deleteMany({
            guildId
        });

        return true;

    } catch (error) {

        console.error(
            "[LEADERBOARD CHAT] Reset error:",
            error
        );

        return false;

    }

}


module.exports = {

    track,

    getTop,

    getRank,

    reset

};
