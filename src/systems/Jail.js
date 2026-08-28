// src/systems/Jail.js

const {
    ChannelType
} = require("discord.js");

const Jail =
    require("../models/Jail");

module.exports = {

    /*
     * Get the guild's jail setup.
     */

    async getSetup(guild) {

        if (!guild) {
            return null;
        }

        const jail =
            await Jail.findOne({
                guildId: guild.id
            });

        if (!jail) {
            return null;
        }

        const role =
            guild.roles.cache.get(
                jail.roleId
            );

        if (!role) {
            return null;
        }

        return {
            jail,
            role
        };

    },


    /*
     * Apply Jailed permissions to all
     * existing categories.
     *
     * IMPORTANT:
     * Only the Jailed role overwrite is
     * changed. Existing permissions for
     * @everyone, staff, bots, etc. remain
     * untouched.
     */

    async syncCategories(guild) {

        const setup =
            await this.getSetup(guild);

        if (!setup) {
            return false;
        }

        const {
            role
        } = setup;

        const categories =
            guild.channels.cache.filter(
                channel =>
                    channel.type ===
                    ChannelType.GuildCategory
            );

        for (
            const category
            of categories.values()
        ) {

            try {

                await category.permissionOverwrites.edit(
                    role,
                    {
                        ViewChannel: false
                    }
                );

            } catch (error) {

                console.error(
                    `[JAIL] Failed to sync category ${category.id}:`,
                    error
                );

            }

        }

        return true;

    },


    /*
     * Apply Jailed permissions to all
     * existing channels.
     *
     * This does NOT lock permissions
     * or copy permissions from categories.
     */

    async syncChannels(guild) {

        const setup =
            await this.getSetup(guild);

        if (!setup) {
            return false;
        }

        const {
            jail,
            role
        } = setup;

        const channels =
            guild.channels.cache.filter(
                channel =>
                    channel.type !==
                    ChannelType.GuildCategory
            );

        for (
            const channel
            of channels.values()
        ) {

            /*
             * Jail channel:
             *
             * Jailed members can see and
             * use it.
             */

            if (
                channel.id ===
                jail.channelId
            ) {

                try {

                    await channel.permissionOverwrites.edit(
                        guild.roles.everyone,
                        {
                            ViewChannel: false
                        }
                    );

                    await channel.permissionOverwrites.edit(
                        role,
                        {
                            ViewChannel: true,
                            SendMessages: true,
                            ReadMessageHistory: true
                        }
                    );

                } catch (error) {

                    console.error(
                        `[JAIL] Failed to sync jail channel ${channel.id}:`,
                        error
                    );

                }

                continue;
            }


            /*
             * Jail logs:
             *
             * Hidden from @everyone
             * and hidden from Jailed.
             */

            if (
                channel.id ===
                jail.logChannelId
            ) {

                try {

                    await channel.permissionOverwrites.edit(
                        guild.roles.everyone,
                        {
                            ViewChannel: false
                        }
                    );

                    await channel.permissionOverwrites.edit(
                        role,
                        {
                            ViewChannel: false
                        }
                    );

                } catch (error) {

                    console.error(
                        `[JAIL] Failed to sync jail logs ${channel.id}:`,
                        error
                    );

                }

                continue;
            }


            /*
             * Normal channel.
             *
             * Only deny the Jailed role.
             * Everything else remains untouched.
             */

            try {

                await channel.permissionOverwrites.edit(
                    role,
                    {
                        ViewChannel: false
                    }
                );

            } catch (error) {

                console.error(
                    `[JAIL] Failed to sync channel ${channel.id}:`,
                    error
                );

            }

        }

        return true;

    },


    /*
     * Full permission synchronization.
     *
     * Use this during jail setup or when
     * manually repairing jail permissions.
     *
     * Do NOT call this every time someone
     * is jailed/unjailled because it would
     * make the command unnecessarily slow.
     */

    async sync(guild) {

        if (!guild) {
            return false;
        }

        const setup =
            await this.getSetup(guild);

        if (!setup) {
            return false;
        }

        await Promise.all([
            this.syncCategories(guild),
            this.syncChannels(guild)
        ]);

        return true;

    },


    /*
     * Remove manageable roles from a member
     * and return their previous role IDs.
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

            try {

                await member.roles.remove(
                    previousRoles,
                    "Jailed"
                );

            } catch (error) {

                console.error(
                    "[JAIL] Failed to remove roles:",
                    error
                );

            }

        }

        return previousRoles;

    },


    /*
     * Restore the roles saved when the
     * member was jailed.
     */

    async restoreRoles(
        member,
        roleIds
    ) {

        if (
            !member ||
            !Array.isArray(roleIds)
        ) {
            return false;
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
            return false;
        }

        try {

            await member.roles.add(
                validRoles,
                "Jail role restoration"
            );

            return true;

        } catch (error) {

            console.error(
                "[JAIL] Failed to restore roles:",
                error
            );

            return false;

        }

    }

};
