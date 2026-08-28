// src/commands/jail/jail.js

const {
    PermissionFlagsBits
} = require("discord.js");

const Jail =
    require("../../models/Jail");

const globalEmbeds =
    require("../../embeds/global");

const jailEmbeds =
    require("../../embeds/jail");

const jailHelp =
    require("../../embeds/help/jail");

module.exports = {

    name: "jail",

    aliases: ["j"],

    permissions: {
        user: ["ManageGuild"],
        bot: ["ManageRoles"]
    },

    async execute(
        client,
        message,
        args
    ) {

        /*
         * Guild only
         */

        if (!message.guild) {
            return;
        }

        /*
         * User permission
         */

        if (
            !message.member.permissions.has(
                PermissionFlagsBits.ManageGuild
            )
        ) {
            return message.channel.send({
                embeds: [
                    globalEmbeds.permission(
                        message.author,
                        "Manage Server"
                    )
                ]
            });
        }

        /*
         * Target
         */

        const targetInput =
            args.shift();

        /*
         * No target = Jail help
         */

        if (!targetInput) {
            return message.channel.send({
                embeds: [
                    jailHelp.jail(
                        message.author
                    )
                ]
            });
        }

        /*
         * Find jail setup
         */

        const jail =
            await Jail.findOne({
                guildId:
                    message.guild.id
            });

        if (!jail) {
            return message.channel.send({
                embeds: [
                    jailEmbeds.noSetup(
                        message.author
                    )
                ]
            });
        }

        /*
         * Resolve target
         *
         * Supports:
         * - Mention
         * - ID
         * - Username
         */

        let target = null;

        try {

            const id =
                targetInput.replace(
                    /[<@!>]/g,
                    ""
                );

            /*
             * ID
             */

            if (
                /^\d{17,20}$/.test(id)
            ) {

                target =
                    await message.guild.members
                        .fetch(id)
                        .catch(() => null);

            }

            /*
             * Mention
             */

            if (!target) {

                target =
                    message.mentions.members.first() ||
                    null;

            }

            /*
             * Cached username
             */

            if (!target) {

                const input =
                    targetInput.toLowerCase();

                target =
                    message.guild.members.cache.find(
                        member =>
                            member.user.username
                                .toLowerCase() ===
                            input
                    ) || null;

            }

            /*
             * Discord username search
             */

            if (!target) {

                const members =
                    await message.guild.members
                        .fetch({
                            query:
                                targetInput,
                            limit: 10
                        })
                        .catch(() => []);

                target =
                    members.find(
                        member =>
                            member.user.username
                                .toLowerCase() ===
                            targetInput.toLowerCase()
                    ) || null;

            }

        } catch (error) {

            console.error(
                "[JAIL] Failed to resolve target:",
                error
            );

            return message.channel.send({
                embeds: [
                    globalEmbeds.notFound(
                        message.author
                    )
                ]
            });

        }

        /*
         * Not found
         */

        if (!target) {
            return message.channel.send({
                embeds: [
                    globalEmbeds.notFound(
                        message.author
                    )
                ]
            });
        }

        /*
         * Self
         */

        if (
            target.id ===
            message.author.id
        ) {
            return message.channel.send({
                embeds: [
                    globalEmbeds.self(
                        message.author
                    )
                ]
            });
        }

        /*
         * Bot
         */

        if (
            target.id ===
            client.user.id
        ) {
            return message.channel.send({
                embeds: [
                    globalEmbeds.self(
                        message.author
                    )
                ]
            });
        }

        /*
         * Already jailed
         */

        const memberRecord =
            jail.members.find(
                member =>
                    member.userId ===
                    target.id
            );

        if (memberRecord) {
            return message.channel.send({
                embeds: [
                    jailEmbeds.alreadyJailed(
                        message.author,
                        target
                    )
                ]
            });
        }

        /*
         * Moderator hierarchy
         */

        if (
            message.member.roles.highest.comparePositionTo(
                target.roles.highest
            ) <= 0
        ) {
            return message.channel.send({
                embeds: [
                    jailEmbeds.hierarchy(
                        message.author,
                        target
                    )
                ]
            });
        }

        /*
         * Bot hierarchy
         */

        const botMember =
            message.guild.members.me ||
            await message.guild.members.fetch(
                client.user.id
            );

        if (
            botMember.roles.highest.comparePositionTo(
                target.roles.highest
            ) <= 0
        ) {
            return message.channel.send({
                embeds: [
                    jailEmbeds.botHierarchy(
                        message.author,
                        target
                    )
                ]
            });
        }

        /*
         * Find Jailed role
         */

        const jailRole =
            message.guild.roles.cache.get(
                jail.roleId
            );

        if (!jailRole) {
            return message.channel.send({
                embeds: [
                    jailEmbeds.noSetup(
                        message.author
                    )
                ]
            });
        }

        /*
         * Bot must manage Jailed role
         */

        if (!jailRole.editable) {
            return message.channel.send({
                embeds: [
                    jailEmbeds.botHierarchy(
                        message.author,
                        target
                    )
                ]
            });
        }

        /*
         * Reason
         */

        const reason =
            args.length
                ? args.join(" ").trim()
                : "No reason provided";

        /*
         * Save current manageable roles
         */

        const roles =
            target.roles.cache
                .filter(
                    role =>
                        role.id !==
                            message.guild.id &&
                        role.id !==
                            jailRole.id &&
                        role.editable
                )
                .map(
                    role =>
                        role.id
                );

        /*
         * Case number
         */

        const caseNumber =
            jail.nextCase || 1;

        /*
         * Apply Jailed role
         */

        try {

            await target.roles.set(
                [jailRole.id],
                "Jailed"
            );

        } catch (error) {

            console.error(
                "[JAIL] Failed to jail member:",
                error
            );

            return;
        }

        /*
         * Save jail record
         */

        jail.members.push({

            userId:
                target.id,

            roles:
                roles,

            reason:
                reason,

            caseNumber:
                caseNumber,

            jailedAt:
                new Date()

        });

        jail.nextCase =
            caseNumber + 1;

        /*
         * Respond first.
         */

        await message.channel.send({
            embeds: [
                jailEmbeds.jailed(
                    message.author,
                    target,
                    reason
                )
            ]
        });

        /*
         * Save in background.
         */

        jail.save().catch(error => {

            console.error(
                "[JAIL] Failed to save jail record:",
                error
            );

        });

        /*
         * Jail log event.
         */

        setImmediate(() => {

            client.emit(
                "jail",
                {
                    action:
                        "jailed",

                    guildId:
                        message.guild.id,

                    member:
                        target,

                    moderator:
                        message.author,

                    reason:
                        reason,

                    caseNumber:
                        caseNumber
                }
            );

        });

        return true;

    }

};
