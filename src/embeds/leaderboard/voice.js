const {
    EmbedBuilder
} = require("discord.js");

const config =
    require("../../config");


/*
 * ============================================================
 * VOICE LEADERBOARD EMBED
 * ============================================================
 */

module.exports = {

    create(
        guild,
        entries,
        nextWipeAt
    ) {

        /*
         * Server icon
         */

        const icon =
            guild.iconURL({
                dynamic: true,
                size: 4096
            });


        /*
         * Build leaderboard
         */

        let leaderboard =
            "";


        if (
            !entries ||
            !entries.length
        ) {

            leaderboard =
                "No voice activity recorded yet.";

        } else {

            leaderboard =
                entries
                    .slice(0, 10)
                    .map(
                        (entry, index) => {

                            const position =
                                index + 1;

                            const user =
                                `<@${entry.userId}>`;

                            const seconds =
                                Number(
                                    entry.totalSeconds || 0
                                );

                            const duration =
                                formatDuration(
                                    seconds
                                );

                            let medal = "";

                            if (
                                position === 1
                            ) {
                                medal = "🥇 ";
                            } else if (
                                position === 2
                            ) {
                                medal = "🥈 ";
                            } else if (
                                position === 3
                            ) {
                                medal = "🥉 ";
                            }

                            return `${medal}${user} — ${duration}`;

                        }
                    )
                    .join("\n");

        }


        /*
         * Time until next wipe
         */

        const footerTime =
            getTimeUntil(
                nextWipeAt
            );


        /*
         * Current day
         */

        const day =
            new Intl.DateTimeFormat(
                "en-US",
                {
                    weekday: "long"
                }
            ).format(
                new Date()
            );


        /*
         * Embed
         */

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
                        `Updates every min • ${day} • Next wipe: in ${footerTime}`
                });


        /*
         * Server thumbnail
         */

        if (
            icon
        ) {

            embed.setThumbnail(
                icon
            );

        }


        return embed;

    }

};


/*
 * ============================================================
 * VOICE DURATION
 * ============================================================
 *
 * Example:
 *
 * 42h 18m
 * 36h 04m
 * 28h 51m
 * ============================================================
 */

function formatDuration(
    totalSeconds
) {

    const hours =
        Math.floor(
            totalSeconds / 3600
        );

    const minutes =
        Math.floor(
            (totalSeconds % 3600) / 60
        );


    return `${hours}h ${String(
        minutes
    ).padStart(2, "0")}m`;

}


/*
 * ============================================================
 * TIME UNTIL WIPE
 * ============================================================
 */

function getTimeUntil(
    target
) {

    if (
        !target
    ) {

        return "unknown";

    }


    const targetTime =
        new Date(
            target
        ).getTime();


    let difference =
        targetTime -
        Date.now();


    if (
        difference <= 0
    ) {

        return "now";

    }


    const day =
        24 * 60 * 60 * 1000;

    const hour =
        60 * 60 * 1000;

    const minute =
        60 * 1000;


    const days =
        Math.floor(
            difference / day
        );

    difference %=
        day;


    const hours =
        Math.floor(
            difference / hour
        );

    difference %=
        hour;


    const minutes =
        Math.floor(
            difference / minute
        );


    if (
        days > 0
    ) {

        return `${days}d ${hours}h`;

    }


    if (
        hours > 0
    ) {

        return `${hours}h ${minutes}m`;

    }


    return `${Math.max(
        minutes,
        1
    )}m`;

}
