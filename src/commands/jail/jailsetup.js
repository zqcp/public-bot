// src/commands/jail/jailsetup.js

const {
    ChannelType,
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

    name: "jail setup",

    aliases: [],

    permissions: {
        user: ["ManageGuild"],
        bot: ["ManageRoles", "ManageChannels"]
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
         * Get bot member
         */

        const botMember =
            message.guild.members.me ||
            await message.guild.members.fetch(
                client.user.id
            );

        /*
         * Bot permissions
         */

        if (
            !botMember.permissions.has(
                PermissionFlagsBits.ManageRoles
            ) ||
            !botMember.permissions.has(
                PermissionFlagsBits.ManageChannels
            )
        ) {
            return message.channel.send({
                embeds: [
                    globalEmbeds.botPermission(
                        message.author,
                        "Manage Roles & Manage Channels"
                    )
                ]
            });
        }

        /*
         * Check existing setup
         */

        const existing =
            await Jail.findOne({
                guildId:
                    message.guild.id
            });

        if (existing) {
            return message.channel.send({
                embeds: [
                    jailEmbeds.alreadySetup(
                        message.author
                    )
                ]
            });
        }

        /*
         * Create Jailed role.
         *
         * No custom color.
         * Discord's normal/default role
         * appearance is used.
         */

        let jailRole;

        try {

            jailRole =
                await message.guild.roles.create({

                    name:
                        "Jailed",

                    reason:
                        "Jail system setup"

                });

        } catch (error) {

            console.error(
                "[JAIL] Failed to create Jailed role:",
                error
            );

            return;
        }

        /*
         * Make sure the bot can manage
         * the Jailed role.
         */

        if (
            jailRole.position >=
            botMember.roles.highest.position
        ) {

            await jailRole.delete().catch(() => {});

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
         * Create Jail channel.
         *
         * No category.
         */

        let jailChannel;

        try {

            jailChannel =
                await message.guild.channels.create({

                    name:
                        "jail",

                    type:
                        ChannelType.GuildText,

                    reason:
                        "Jail system setup"

                });

        } catch (error) {

            console.error(
                "[JAIL] Failed to create jail channel:",
                error
            );

            await jailRole.delete().catch(() => {});

            return;
        }

        /*
         * Create Jail logs channel.
         *
         * No category.
         */

        let logChannel;

        try {

            logChannel =
                await message.guild.channels.create({

                    name:
                        "jail-logs",

                    type:
                        ChannelType.GuildText,

                    reason:
                        "Jail system setup"

                });

        } catch (error) {

            console.error(
                "[JAIL] Failed to create jail logs:",
                error
            );

            await jailChannel
                .delete()
                .catch(() => {});

            await jailRole
                .delete()
                .catch(() => {});

            return;
        }

        /*
         * Save guild configuration.
         *
         * categoryId is intentionally null
         * because the jail system does not
         * use a category.
         */

        try {

            await Jail.create({

                guildId:
                    message.guild.id,

                roleId:
                    jailRole.id,

                categoryId:
                    null,

                channelId:
                    jailChannel.id,

                logChannelId:
                    logChannel.id,

                nextCase:
                    1,

                members:
                    []

            });

        } catch (error) {

            console.error(
                "[JAIL] Failed to save jail configuration:",
                error
            );

            await logChannel
                .delete()
                .catch(() => {});

            await jailChannel
                .delete()
                .catch(() => {});

            await jailRole
                .delete()
                .catch(() => {});

            return;
        }

        /*
         * Apply jail permissions.
         *
         * This runs ONLY during setup.
         *
         * Normal existing channels:
         * Jailed = ViewChannel false
         *
         * #jail:
         * @everyone = hidden
         * Jailed = visible + can send
         *
         * #jail-logs:
         * @everyone = hidden
         * Jailed = hidden
         *
         * Existing permissions for every
         * other role are left untouched.
         */

        const synced =
            await JailSystem.sync(
                message.guild
            );

        if (!synced) {

            console.error(
                "[JAIL] Failed to synchronize jail permissions."
            );

        }

        /*
         * Success
         */

        return message.channel.send({
            embeds: [
                jailEmbeds.setup(
                    message.author
                )
            ]
        });

    }

};
