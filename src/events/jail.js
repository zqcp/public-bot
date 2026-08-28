// src/events/jail.js

const Jail =
    require("../models/Jail");

const jailLogs =
    require("../embeds/jailLogs");

module.exports = {

    name: "jail",

    once: false,

    async execute(
        data,
        client
    ) {

        /*
         * Validate event data
         */

        if (
            !data ||
            !data.guildId ||
            !data.member ||
            !data.moderator ||
            !data.action
        ) {
            return;
        }

        /*
         * Find guild jail setup
         */

        const jail =
            await Jail.findOne({
                guildId:
                    data.guildId
            });

        if (!jail) {
            return;
        }

        /*
         * Find jail log channel
         */

        const channel =
            client.channels.cache.get(
                jail.logChannelId
            ) ||
            await client.channels.fetch(
                jail.logChannelId
            ).catch(() => null);

        if (!channel) {
            return;
        }

        /*
         * Jail log
         */

        if (
            data.action === "jailed"
        ) {

            const embed =
                jailLogs.jailed(
                    data.member,
                    data.moderator,
                    data.reason,
                    data.caseNumber
                );

            return channel.send({
                embeds: [
                    embed
                ]
            }).catch(error => {

                console.error(
                    "[JAIL LOG] Failed to send jail log:",
                    error
                );

            });

        }

        /*
         * Unjail log
         */

        if (
            data.action === "unjail"
        ) {

            const embed =
                jailLogs.unjailed(
                    data.member,
                    data.moderator,
                    data.caseNumber
                );

            return channel.send({
                embeds: [
                    embed
                ]
            }).catch(error => {

                console.error(
                    "[JAIL LOG] Failed to send unjail log:",
                    error
                );

            });

        }

    }

};
