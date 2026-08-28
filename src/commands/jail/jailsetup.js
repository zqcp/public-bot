// src/commands/jail/jailsetup.js

const {
    ChannelType,
    PermissionFlagsBits
} = require("discord.js");

const Jail =
    require("../../models/Jail");

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
         * Bot permissions
         */

        const botMember =
            message.guild.members.me ||
            await message.guild.members.fetch(
                client.user.id
            );

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
         * Create Jailed role
         */

        const jailRole =
            await message.guild.roles.create({
                name: "Jailed",
                reason:
                    "Jail system setup"
            });

        /*
         * Create Jail category
         */

        const jailCategory =
            await message.guild.channels.create({
                name: "Jail",
                type: ChannelType.GuildCategory,
                reason:
                    "Jail system setup"
            });

        /*
         * Create Jail channel
         */

        const jailChannel =
            await message.guild.channels.create({
                name: "jail",
                type: ChannelType.GuildText,
                parent:
                    jailCategory.id,
                reason:
                    "Jail system setup"
            });

        /*
         * Create Jail logs channel
         */

        const logChannel =
            await message.guild.channels.create({
                name: "jail-logs",
                type: ChannelType.GuildText,
                parent:
                    jailCategory.id,
                reason:
                    "Jail system setup"
            });

        /*
         * Jail channel permissions
         */

        await jailChannel.permissionOverwrites.edit(
            message.guild.roles.everyone,
            {
                ViewChannel: false
            }
        );

        await jailChannel.permissionOverwrites.edit(
            jailRole,
            {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true
            }
        );

        /*
         * Hide jail logs from @everyone
         */

        await logChannel.permissionOverwrites.edit(
            message.guild.roles.everyone,
            {
                ViewChannel: false
            }
        );

        /*
         * Save guild configuration
         */

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

            nextCase: 1,

            members: []
        });

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
