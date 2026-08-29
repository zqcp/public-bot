const {
    EmbedBuilder
} = require("discord.js");

const config =
    require("../../config");


module.exports = {

    create(
        guild,
        entries,
        nextWipeAt
    ) {

        const leaderboard =
            entries?.length
                ? entries
                    .slice(0, 10)
                    .map(
                        (entry, index) => {

                            const position =
                                index + 1;

                            const medal =
                                position === 1
                                    ? "🥇"
                                    : position === 2
                                        ? "🥈"
                                        : position === 3
                                            ? "🥉"
                                            : `${position}.`;

                            return `${medal} <@${entry.userId}> — **${formatDuration(entry.totalSeconds)}**`;

                        }
                    )
                    .join("\n")
                : "No voice activity recorded yet.";


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
                    leaderboard
                )
                .setFooter({
                    text:
                        `Updates every min • ${day} • Next wipe: in ${timeUntil(nextWipeAt)}`
                });


        const icon =
            guild.iconURL({
                dynamic: true,
                size: 4096
            });


        if (icon) {

            embed.setThumbnail(
                icon
            );

        }


        return embed;

    }

};


function formatDuration(
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


    if (
        difference <= 0
    ) {

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
