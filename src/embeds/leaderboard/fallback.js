const {
    EmbedBuilder
} = require("discord.js");

const config =
    require("../../config");


module.exports = {

    /*
     * ========================================================
     * CHAT FALLBACK
     * ========================================================
     */

    chat(
        guild,
        entries,
        nextWipeAt
    ) {

        const icon =
            guild.iconURL({
                dynamic: true,
                size: 4096
            });


        const leaderboard =
            buildChatLeaderboard(
                entries
            );


        const footerTime =
            getTimeUntil(
                nextWipeAt
            );


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
                    "💬 Chat Leaderboard"
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
                        `Last saved data • ${day} • Next wipe: in ${footerTime}`
                });


        if (
            icon
        ) {

            embed.setThumbnail(
                icon
            );

        }


        return embed;

    },


    /*
     * ========================================================
     * VOICE FALLBACK
     * ========================================================
     */

    voice(
        guild,
        entries,
        nextWipeAt
    ) {

        const icon =
            guild.iconURL({
                dynamic: true,
                size: 4096
            });


        const leaderboard =
            buildVoiceLeaderboard(
                entries
            );


        const footerTime =
            getTimeUntil(
                nextWipeAt
            );


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
                    "🎙️ Voice Leaderboard"
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
                        `Last saved data • ${day} • Next wipe: in ${footerTime}`
                });


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
 * CHAT LEADERBOARD
 * ============================================================
 */

function buildChatLeaderboard(
    entries
) {

    if (
        !entries ||
        !entries.length
    ) {

        return "No messages recorded yet.";

    }


    return entries
        .slice(0, 10)
        .map(
            (entry, index) => {

                const position =
                    index + 1;

                const user =
                    `<@${entry.userId}>`;

                const messages =
                    Number(
                        entry.messages || 0
                    ).toLocaleString();

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

                return `${medal}${user} — ${messages} messages`;

            }
        )
        .join("\n");

}


/*
 * ============================================================
 * VOICE LEADERBOARD
 * ============================================================
 */

function buildVoiceLeaderboard(
    entries
) {

    if (
        !entries ||
        !entries.length
    ) {

        return "No voice activity recorded yet.";

    }


    return entries
        .slice(0, 10)
        .map(
            (entry, index) => {

                const position =
                    index + 1;

                const user =
                    `<@${entry.userId}>`;

                const totalSeconds =
                    Number(
                        entry.totalSeconds || 0
                    );

                const duration =
                    formatVoiceDuration(
                        totalSeconds
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
 * ============================================================
 * VOICE TIME FORMAT
 * ============================================================
 */

function formatVoiceDuration(
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
 * WIPE COUNTDOWN
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


    let difference =
        new Date(
            target
        ).getTime() -
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
