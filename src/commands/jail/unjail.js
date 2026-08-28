// src/commands/jail/unjail.js

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
         * Target
         */

        const targetInput =
            args.shift();

        /*
         * No target = Unjail help
         */

        if (!targetInput) {
            return message.channel.send({
                embeds: [
                    jailHelp.unjail(
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
                "[UNJAIL] Failed to resolve target:",
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
         * Bot must be able to manage
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
         * Restore previous roles.
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
         * Restore roles and remove
         * the Jailed role.
         */

        try {

            await target.roles.set(
                rolesToRestore,
                "Unjailed"
            );

        } catch (error) {

            console.error(
                "[UNJAIL] Failed to restore roles:",
                error
            );

            return;
        }

        /*
         * Remove jail record.

         * Do this locally and save in
         * the background so the command
         * responds faster.
         */

        jail.members.splice(
            recordIndex,
            1
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
         * Save in background.
         */

        jail.save().catch(error => {

            console.error(
                "[UNJAIL] Failed to save jail record:",
                error
            );

        });

        /*
         * Send unjail log event.
         */

        setImmediate(() => {

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

        });

        return true;

    }

};
