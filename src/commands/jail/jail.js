// src/commands/jail/jail.js

const {
    PermissionFlagsBits
} = require("discord.js");

const Jail =
    require("../../models/Jail");

const JailSystem =
    require("../../systems/Jail");

const globalEmbeds =
    require("../../embeds/global");

const jailEmbeds =
    require("../../embeds/jail");

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
         * Find target
         *
         * Supports:
         * @mention
         * User ID
         * Username
         * Display name
         */

        let target = null;

        const mention =
            message.mentions.members.first();

        if (mention) {

            target = mention;

        } else if (args[0]) {

            const input =
                args[0].toLowerCase();

            /*
             * Try ID
             */

            if (
                /^\d{17,20}$/.test(
                    args[0]
                )
            ) {

                target =
                    await message.guild.members
                        .fetch(args[0])
                        .catch(() => null);

            }

            /*
             * Try exact username/display name
             */

            if (!target) {

                target =
                    message.guild.members.cache.find(
                        member =>
                            member.user.username
                                .toLowerCase() ===
                                input ||
                            member.displayName
                                .toLowerCase() ===
                                input
                    );

            }

            /*
             * Try partial username/display name
             */

            if (!target) {

                target =
                    message.guild.members.cache.find(
                        member =>
                            member.user.username
                                .toLowerCase()
                                .includes(input) ||
                            member.displayName
                                .toLowerCase()
                                .includes(input)
                    );

            }

        }

        /*
         * No target
         */

        if (!target) {
            return;
        }

        /*
         * Can't jail yourself
         */

        if (
            target.id ===
            message.author.id
        ) {
            return;
        }

        /*
         * Can't jail the bot
         */

        if (
            target.id ===
            client.user.id
        ) {
            return;
        }

        /*
         * Check if already jailed
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
         * Get bot member
         */

        const botMember =
            message.guild.members.me ||
            await message.guild.members.fetch(
                client.user.id
            );

        /*
         * Moderator hierarchy
         */

        if (
            target.roles.highest.position >=
            message.member.roles.highest.position
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

        if (
            target.roles.highest.position >=
            botMember.roles.highest.position
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
         * Make sure the bot can manage
         * the Jailed role.
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
         * Reason is optional.
         *
         * First argument = target.
         * Everything after it = reason.
         */

        const reason =
            args
                .slice(1)
                .join(" ")
                .trim() ||
            "No reason provided";

        /*
         * Save the member's current
         * manageable roles.
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
         * Get persistent case number.
         */

        const caseNumber =
            jail.nextCase || 1;

        /*
         * Apply Jailed role.
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
         * Save jail record.
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

        /*
         * Increment case number.
         */

        jail.nextCase =
            caseNumber + 1;

        await jail.save();

        /*
         * Synchronize jail permissions.
         *
         * This applies the Jailed role to
         * all categories and keeps the Jail
         * category accessible.
         */

        await JailSystem.sync(
            message.guild
        );

        /*
         * User-facing response
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
         * Jail log event
         */

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

        return true;

    }

};
