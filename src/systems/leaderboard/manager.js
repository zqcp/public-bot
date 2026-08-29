// src/systems/leaderboard/manager.js

const {
    EmbedBuilder
} = require("discord.js");

const LeaderboardConfig =
    require("../../models/LeaderboardConfig");

const ChatLeaderboard =
    require("../../models/ChatLeaderboard");

const VoiceLeaderboard =
    require("../../models/VoiceLeaderboard");

const config =
    require("../../config");


const UPDATE_INTERVAL =
    60 * 1000;

let timer = null;
let updating = false;


/*
 * Start manager
 */

function start(client) {

    if (timer) {
        return;
    }

    update(client);

    timer = setInterval(
        () => update(client),
        UPDATE_INTERVAL
    );

    console.log(
        "[LEADERBOARD] Manager started."
    );

}


/*
 * Update every configured guild
 */

async function update(client) {

    if (updating) {
        return;
    }

    updating = true;

    try {

        const configs =
            await LeaderboardConfig.find({});


        for (const data of configs) {

            try {

                const guild =
                    client.guilds.cache.get(
                        data.guildId
                    );

                if (!guild) {
                    continue;
                }


                /*
                 * Weekly wipe
                 */

                if (
                    Date.now() >=
                    new Date(
                        data.nextWipeAt
                    ).getTime()
                ) {

                    await ChatLeaderboard.deleteMany({
                        guildId:
                            data.guildId
                    });

                    await VoiceLeaderboard.deleteMany({
                        guildId:
                            data.guildId
                    });


                    const now =
                        new Date();


                    data.weekStartedAt =
                        now;

                    data.nextWipeAt =
                        new Date(
                            now.getTime() +
                            7 * 24 * 60 * 60 * 1000
                        );


                    await data.save();

                }


                /*
                 * Update chat leaderboard
                 */

                if (
                    data.chatChannelId &&
                    data.chatMessageId
                ) {

                    await updateChat(
                        guild,
                        data
                    );

                }


                /*
                 * Update voice leaderboard
                 */

                if (
                    data.voiceChannelId &&
                    data.voiceMessageId
                ) {

                    await updateVoice(
                        guild,
                        data
                    );

                }

            } catch (error) {

                console.error(
                    `[LEADERBOARD] ${data.guildId}:`,
                    error
                );

            }

        }

    } catch (error) {

        console.error(
            "[LEADERBOARD] Update error:",
            error
        );

    } finally {

        updating = false;

    }

}


/*
 * Chat leaderboard
 */

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
        await channel.messages.fetch(
            data.chatMessageId
        ).catch(
            () => null
        );

    if (!message) {
        return;
    }


    const users =
        await ChatLeaderboard.find({
            guildId:
                guild.id
        })
        .sort({
            messages: -1
        })
        .limit(10)
        .lean();


    const description =
        users.length
            ? users.map(
                (user, index) =>
                    `${medal(index)} <@${user.userId}> — **${Number(user.messages || 0).toLocaleString()}**`
            ).join("\n")
            : "No messages yet.";


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
                    guild.name
            })
            .setDescription(
                description
            )
            .setFooter({
                text:
                    `Updates every min • ${day()} • Next wipe: in ${countdown(data.nextWipeAt)}`
            });


    const icon =
        guild.iconURL({
            dynamic: true,
            size: 4096
        });

    if (icon) {
        embed.setThumbnail(icon);
    }


    await message.edit({
        embeds: [embed]
    });

}


/*
 * Voice leaderboard
 */

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
        await channel.messages.fetch(
            data.voiceMessageId
        ).catch(
            () => null
        );

    if (!message) {
        return;
    }


    const users =
        await VoiceLeaderboard.find({
            guildId:
                guild.id
        })
        .sort({
            totalSeconds: -1
        })
        .limit(10)
        .lean();


    const description =
        users.length
            ? users.map(
                (user, index) =>
                    `${medal(index)} <@${user.userId}> — **${voiceTime(user.totalSeconds)}**`
            ).join("\n")
            : "No voice activity yet.";


    const embed =
        new EmbedBuilder()
            .setColor(
                config.colors.regular
            )
            .setTitle(
                "🎙️ Voice Leaderboard"
            )
            .setAuthor({
                name:
                    guild.name
            })
            .setDescription(
                description
            )
            .setFooter({
                text:
                    `Updates every min • ${day()} • Next wipe: in ${countdown(data.nextWipeAt)}`
            });


    const icon =
        guild.iconURL({
            dynamic: true,
            size: 4096
        });

    if (icon) {
        embed.setThumbnail(icon);
    }


    await message.edit({
        embeds: [embed]
    });

}


/*
 * Medal
 */

function medal(index) {

    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";

    return `${index + 1}.`;

}


/*
 * Voice time
 */

function voiceTime(seconds) {

    seconds =
        Math.max(
            0,
            Number(seconds) || 0
        );


    const hours =
        Math.floor(
            seconds / 3600
        );

    const minutes =
        Math.floor(
            (seconds % 3600) / 60
        );


    return `${hours}h ${String(
        minutes
    ).padStart(2, "0")}m`;

}


/*
 * Current day
 */

function day() {

    return new Intl.DateTimeFormat(
        "en-US",
        {
            weekday: "long"
        }
    ).format(
        new Date()
    );

}


/*
 * Next wipe countdown
 */

function countdown(
    date
) {

    let ms =
        new Date(date).getTime() -
        Date.now();


    if (ms <= 0) {
        return "now";
    }


    const days =
        Math.floor(
            ms / 86400000
        );

    ms %= 86400000;


    const hours =
        Math.floor(
            ms / 3600000
        );


    if (days) {
        return `${days}d ${hours}h`;
    }


    const minutes =
        Math.floor(
            ms / 60000
        );


    if (hours) {
        return `${hours}h ${minutes}m`;
    }


    return `${Math.max(
        1,
        minutes
    )}m`;

}


/*
 * Stop manager
 */

function stop() {

    if (!timer) {
        return;
    }

    clearInterval(timer);

    timer = null;

}


module.exports = {
    start,
    stop,
    update
};
