const {
    EmbedBuilder
} = require("discord.js");

const config =
    require("../../config");


module.exports = {

    chat(
        guild,
        entries,
        nextWipeAt
    ) {

        return create(
            guild,
            buildChat(entries),
            nextWipeAt,
            "💬 Chat Leaderboard"
        );

    },


    voice(
        guild,
        entries,
        nextWipeAt
    ) {

        return create(
            guild,
            buildVoice(entries),
            nextWipeAt,
            "🎙️ Voice Leaderboard"
        );

    }

};


function create(
    guild,
    leaderboard,
    nextWipeAt,
    title
) {

    const day =
        new Intl.DateTimeFormat(
            "en-US",
            {
                weekday: "long"
            }
        ).format(
            new Date()
        );


    const embed =
        new EmbedBuilder()
            .setColor(
                config.colors.failed
            )
            .setTitle(
                title
            )
            .setAuthor({
                name:
                    guild.name
            })
            .setDescription(
                `${leaderboard}\n\n` +
                `${config.emojis.failed} Leaderboard temporarily unavailable. Showing the last saved data.`
            )
            .setFooter({
                text:
                    `Last saved data • ${day} • Next wipe: in ${timeUntil(nextWipeAt)}`
            });


    const icon =
        guild.iconURL({
            dynamic: true,
            size: 4096
        });


    if (icon) {
        embed.setThumbnail(icon);
    }


    return embed;

}


function buildChat(
    entries
) {

    if (!entries?.length) {
        return "No messages recorded yet.";
    }


    return entries
        .slice(0, 10)
        .map(
            (entry, index) =>
                `${medal(index)} <@${entry.userId}> — **${Number(entry.messages || 0).toLocaleString()}**`
        )
        .join("\n");

}


function buildVoice(
    entries
) {

    if (!entries?.length) {
        return "No voice activity recorded yet.";
    }


    return entries
        .slice(0, 10)
        .map(
            (entry, index) =>
                `${medal(index)} <@${entry.userId}> — **${formatVoice(entry.totalSeconds)}**`
        )
        .join("\n");

}


function medal(
    index
) {

    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";

    return `${index + 1}.`;

}


function formatVoice(
    seconds
) {

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
            (
                seconds % 3600
            ) / 60
        );


    return `${hours}h ${String(
        minutes
    ).padStart(2, "0")}m`;

}


function timeUntil(
    target
) {

    if (!target) {
        return "unknown";
    }


    const difference =
        new Date(target).getTime() -
        Date.now();


    if (difference <= 0) {
        return "now";
    }


    const days =
        Math.floor(
            difference / 86400000
        );

    const hours =
        Math.floor(
            (
                difference % 86400000
            ) / 3600000
        );

    const minutes =
        Math.floor(
            (
                difference % 3600000
            ) / 60000
        );


    if (days > 0) {
        return `${days}d ${hours}h`;
    }


    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }


    return `${Math.max(
        minutes,
        1
    )}m`;

}
