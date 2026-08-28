// src/systems/Jail.js

const {
    PermissionFlagsBits,
    ChannelType
} = require("discord.js");

const Jail =
    require("../models/Jail");

module.exports = {

    /*
     * Apply the jail permissions to the
     * configured jail channel.
     */

    async syncJailChannel(
        guild
    ) {

        if (!guild) {
            return;
        }

        const jail =
            await Jail.findOne({
                guildId:
                    guild.id
            });

        if (!jail) {
            return;
        }

        const role =
            guild.roles.cache.get(
                jail.roleId
            );

        const channel =
            guild.channels.cache.get(
                jail.channelId
            );

        if (!role || !channel) {
            return;
        }

        /*
         * Jailed members can see and use
         * the jail channel.
         */

        await channel.permissionOverwrites.edit(
            role,
            {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true
            }
        ).catch(error => {

            console.error(
                "[JAIL] Failed to sync jail channel:",
                error
            );

        });

    },


    /*
     * Make the Jailed role unable to see
     * normal guild channels.
     *
     * Existing staff/admin permissions are
     * not modified.
     */

    async syncGuildChannels(
        guild
    ) {

        if (!guild) {
            return;
        }

        const jail =
            await Jail.findOne({
                guildId:
                    guild.id
            });

        if (!jail) {
            return;
        }

        const role =
            guild.roles.cache.get(
                jail.roleId
            );

        if (!role) {
            return;
        }

        for (
            const channel
            of guild.channels.cache.values()
        ) {

            /*
             * Skip categories and the jail channel.
             */

            if (
                channel.type ===
                ChannelType.GuildCategory
            ) {
                continue;
            }

            if (
                channel.id ===
                jail.channelId
            ) {
                continue;
            }

            /*
             * Don't overwrite an existing
             * explicit Jailed-role permission.
             *
             * This allows staff to customize
             * specific channels later.
             */

            const existing =
                channel.permissionOverwrites.cache.get(
                    role.id
                );

            if (existing) {
                continue;
            }

            /*
             * Hide normal channels from jailed
             * members.
             */

            await channel.permissionOverwrites.edit(
                role,
                {
                    ViewChannel: false
                }
            ).catch(error => {

                console.error(
                    `[JAIL] Failed to sync channel ${channel.id}:`,
                    error
                );

            });

        }

    },


    /*
     * Full synchronization.
     */

    async sync(
        guild
    ) {

        if (!guild) {
            return;
        }

        await this.syncJailChannel(
            guild
        );

        await this.syncGuildChannels(
            guild
        );

    },


    /*
     * Restore a member's previous roles.
     */

    async restoreRoles(
        member,
        roleIds
    ) {

        if (
            !member ||
            !Array.isArray(roleIds)
        ) {
            return;
        }

        const validRoles =
            roleIds
                .map(
                    roleId =>
                        member.guild.roles.cache.get(
                            roleId
                        )
                )
                .filter(
                    role =>
                        role &&
                        role.editable
                );

        if (!validRoles.length) {
            return;
        }

        await member.roles.add(
            validRoles,
            "Jail role restoration"
        ).catch(error => {

            console.error(
                "[JAIL] Failed to restore roles:",
                error
            );

        });

    },


    /*
     * Remove all manageable roles from
     * a member before applying the jail role.
     */

    async removeRoles(
        member,
        jailRole
    ) {

        if (
            !member ||
            !jailRole
        ) {
            return [];
        }

        const previousRoles =
            member.roles.cache
                .filter(
                    role =>
                        role.id !==
                        member.guild.id &&
                        role.id !==
                        jailRole.id &&
                        role.editable
                )
                .map(
                    role =>
                        role.id
                );

        if (
            previousRoles.length
        ) {

            await member.roles.remove(
                previousRoles,
                "Jailed"
            ).catch(error => {

                console.error(
                    "[JAIL] Failed to remove roles:",
                    error
                );

            });

        }

        return previousRoles;

    }

};
