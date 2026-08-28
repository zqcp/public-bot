// src/commands/jail/jailunsetup.js

const {
    PermissionFlagsBits,
    ChannelType
} = require("discord.js");

const Jail =
    require("../../models/Jail");

const globalEmbeds =
    require("../../embeds/global");

const jailEmbeds =
    require("../../embeds/jail");

module.exports = {

    name: "jail unsetup",

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
         * Find guild jail setup
         */

        const jail =
            await Jail.findOne({
                guildId:
                    message.guild.id
            });

        /*
         * No setup
         */

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
         * Do not remove the system while
         * members are still jailed.
         */

        if (
            Array.isArray(jail.members) &&
            jail.members.length > 0
        ) {
            return message.channel.send({
                embeds: [
                    jailEmbeds.unsetupBlocked(
                        message.author,
                        jail.members.length
                    )
                ]
            });
        }

        /*
         * Find configured Jailed role.
         */

        const jailRole =
            message.guild.roles.cache.get(
                jail.roleId
            );

        /*
         * Make sure the bot can delete
         * the Jailed role.
         */

        if (
            jailRole &&
            !jailRole.editable
        ) {
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
         * Remove Jailed role overwrites
         * from every category first.
         *
         * This cleans up the permissions
         * created by the jail system.
         */

        if (jailRole) {

            const categories =
                message.guild.channels.cache.filter(
                    channel =>
                        channel.type ===
                        ChannelType.GuildCategory
                );

            for (
                const category
                of categories.values()
            ) {

                const overwrite =
                    category.permissionOverwrites.cache.get(
                        jailRole.id
                    );

                if (!overwrite) {
                    continue;
                }

                await category.permissionOverwrites
                    .delete(
                        jailRole.id
                    )
                    .catch(error => {

                        console.error(
                            `[JAIL] Failed to remove Jailed permission from category ${category.id}:`,
                            error
                        );

                    });

            }

        }

        /*
         * Delete jail channel.
         */

        const jailChannel =
            message.guild.channels.cache.get(
                jail.channelId
            );

        if (jailChannel) {

            await jailChannel
                .delete(
                    "Jail system unsetup"
                )
                .catch(error => {

                    console.error(
                        "[JAIL] Failed to delete jail channel:",
                        error
                    );

                });

        }

        /*
         * Delete jail logs channel.
         */

        const logChannel =
            message.guild.channels.cache.get(
                jail.logChannelId
            );

        if (logChannel) {

            await logChannel
                .delete(
                    "Jail system unsetup"
                )
                .catch(error => {

                    console.error(
                        "[JAIL] Failed to delete jail logs:",
                        error
                    );

                });

        }

        /*
         * Delete jail category.
         *
         * Any remaining child channels will
         * be handled by Discord if applicable,
         * but normally the two jail channels
         * were already deleted above.
         */

        const category =
            message.guild.channels.cache.get(
                jail.categoryId
            );

        if (
            category &&
            category.type ===
                ChannelType.GuildCategory
        ) {

            await category
                .delete(
                    "Jail system unsetup"
                )
                .catch(error => {

                    console.error(
                        "[JAIL] Failed to delete jail category:",
                        error
                    );

                });

        }

        /*
         * Delete Jailed role.
         */

        if (
            jailRole &&
            jailRole.editable
        ) {

            await jailRole
                .delete(
                    "Jail system unsetup"
                )
                .catch(error => {

                    console.error(
                        "[JAIL] Failed to delete jail role:",
                        error
                    );

                });

        }

        /*
         * Remove MongoDB configuration.
         */

        await Jail.deleteOne({
            guildId:
                message.guild.id
        });

        /*
         * Success.
         */

        return message.channel.send({
            embeds: [
                jailEmbeds.unsetup(
                    message.author
                )
            ]
        });

    }

};
