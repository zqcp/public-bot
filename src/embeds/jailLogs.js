// src/embeds/jailLogs.js

const {
    EmbedBuilder
} = require("discord.js");

const config =
    require("../config");

module.exports = {

    jailed(
        member,
        moderator,
        reason,
        caseNumber
    ) {

        return new EmbedBuilder()
            .setColor(
                config.colors.regular
            )
            .setAuthor({
                name:
                    moderator.username,

                iconURL:
                    moderator.displayAvatarURL({
                        dynamic: true
                    })
            })
            .setTitle(
                `Member jailed - case #${caseNumber}`
            )
            .setDescription(
`**member**
${member}
\`${member.id}\`
**moderator**
${moderator}
**reason**
${reason || "n/a"}`
            )
            .setFooter({
                text:
                    `user id: ${member.id} | ${new Date().toLocaleString(
                        "en-US",
                        {
                            month: "numeric",
                            day: "numeric",
                            year: "2-digit",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true
                        }
                    )}`
            });

    },


    unjailed(
        member,
        moderator,
        caseNumber
    ) {

        return new EmbedBuilder()
            .setColor(
                config.colors.regular
            )
            .setAuthor({
                name:
                    moderator.username,

                iconURL:
                    moderator.displayAvatarURL({
                        dynamic: true
                    })
            })
            .setTitle(
                `Member unjailed - case #${caseNumber}`
            )
            .setDescription(
`**member**
${member}
\`${member.id}\`
**moderator**
${moderator}`
            )
            .setFooter({
                text:
                    `user id: ${member.id} | ${new Date().toLocaleString(
                        "en-US",
                        {
                            month: "numeric",
                            day: "numeric",
                            year: "2-digit",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true
                        }
                    )}`
            });

    }

};
