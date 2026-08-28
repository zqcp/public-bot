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
         * Discord's default role color is used.
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
         * Make sure bot can manage
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
         * Create Jail category.
         */

        let jailCategory;

        try {

            jailCategory =
                await message.guild.channels.create({

                    name:
                        "Jail",

                    type:
                        ChannelType.GuildCategory,

                    reason:
                        "Jail system setup"

                });

        } catch (error) {

            console.error(
                "[JAIL] Failed to create Jail category:",
                error
            );

            await jailRole.delete().catch(() => {});

            return;
        }

        /*
         * Create Jail channel.
         */

        let jailChannel;

        try {

            jailChannel =
                await message.guild.channels.create({

                    name:
                        "jail",

                    type:
                        ChannelType.GuildText,

                    parent:
                        jailCategory.id,

                    reason:
                        "Jail system setup"

                });

        } catch (error) {

            console.error(
                "[JAIL] Failed to create jail channel:",
                error
            );

            await jailCategory.delete().catch(() => {});
            await jailRole.delete().catch(() => {});

            return;
        }

        /*
         * Create Jail logs channel.
         */

        let logChannel;

        try {

            logChannel =
                await message.guild.channels.create({

                    name:
                        "jail-logs",

                    type:
                        ChannelType.GuildText,

                    parent:
                        jailCategory.id,

                    reason:
                        "Jail system setup"

                });

        } catch (error) {

            console.error(
                "[JAIL] Failed to create jail logs:",
                error
            );

            await jailChannel.delete().catch(() => {});
            await jailCategory.delete().catch(() => {});
            await jailRole.delete().catch(() => {});

            return;
        }

        /*
         * Save guild configuration.
         */

        try {

            await Jail.create({

                guildId:
                    message.guild.id,

                roleId:
                    jailRole.id,

                categoryId:
                    jailCategory.id,

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

            await logChannel.delete().catch(() => {});
            await jailChannel.delete().catch(() => {});
            await jailCategory.delete().catch(() => {});
            await jailRole.delete().catch(() => {});

            return;
        }

        /*
         * Apply jail permissions.
         *
         * This synchronizes the Jailed role
         * with the jail category and channels.
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
         * Success.
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
