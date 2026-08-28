// src/commands/jail/unjail.js

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

    name: "unjail",

    aliases: ["unj"],

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
             * Try user ID
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
         * Find jail record
         */

        const recordIndex =
            jail.members.findIndex(
                member =>
                    member.userId ===
                    target.id
            );

        if (
            recordIndex === -1
        ) {
            return message.channel.send({
                embeds: [
                    jailEmbeds.notJailed(
                        message.author,
                        target
                    )
                ]
            });
        }

        const record =
            jail.members[
                recordIndex
            ];

        /*
         * Find Jailed role
         */

        const jailRole =
            message.guild.roles.cache.get(
                jail.roleId
            );

        /*
         * Make sure the Jailed role exists.
         */

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
                    globalEmbeds.botPermission(
                        message.author,
                        "Manage Roles"
                    )
                ]
            });
        }

        /*
         * Find previous roles.
         *
         * Only restore roles that:
         * - still exist
         * - are editable by the bot
         */

        const rolesToRestore =
            Array.isArray(record.roles)
                ? record.roles
                    .map(
                        roleId =>
                            message.guild.roles.cache.get(
                                roleId
                            )
                    )
                    .filter(
                        role =>
                            role &&
                            role.id !==
                                message.guild.id &&
                            role.id !==
                                jailRole.id &&
                            role.editable
                    )
                    .map(
                        role =>
                            role.id
                    )
                : [];

        /*
         * Restore previous roles.
         *
         * @everyone is automatically kept
         * by Discord.
         */

        try {

            await target.roles.set(
                rolesToRestore,
                "Unjailed"
            );

        } catch (error) {

            console.error(
                "[JAIL] Failed to restore roles:",
                error
            );

            return;
        }

        /*
         * Remove jail record.
         */

        jail.members.splice(
            recordIndex,
            1
        );

        await jail.save();

        /*
         * Re-sync jail permissions.
         */

        await JailSystem.sync(
            message.guild
        );

        /*
         * User-facing response.
         */

        await message.channel.send({
            embeds: [
                jailEmbeds.unjailed(
                    message.author,
                    target
                )
            ]
        });

        /*
         * Send unjail log event.
         */

        client.emit(
            "jail",
            {
                action:
                    "unjail",

                guildId:
                    message.guild.id,

                member:
                    target,

                moderator:
                    message.author,

                caseNumber:
                    record.caseNumber || "N/A"
            }
        );

        return true;

    }

};
