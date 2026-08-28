// src/systems/Jail.js

const {
    ChannelType
} = require("discord.js");

const Jail =
    require("../models/Jail");

module.exports = {

    /*
     * Find the guild's jail setup,
     * role and jail category.
     */

    async getSetup(
        guild
    ) {

        if (!guild) {
            return null;
        }

        const jail =
            await Jail.findOne({
                guildId:
                    guild.id
            });

        if (!jail) {
            return null;
        }

        const role =
            guild.roles.cache.get(
                jail.roleId
            );

        const category =
            guild.channels.cache.get(
                jail.categoryId
            );

        if (
            !role ||
            !category ||
            category.type !==
                ChannelType.GuildCategory
        ) {
            return null;
        }

        return {
            jail,
            role,
            category
        };

    },


    /*
     * Apply permissions to ALL categories.
     *
     * Normal categories:
     * Jailed cannot see them.
     *
     * Jail category:
     * Jailed can see it.
     */

    async syncCategories(
        guild
    ) {

        const setup =
            await this.getSetup(
                guild
            );

        if (!setup) {
            return false;
        }

        const {
            jail,
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

                /*
                 * The Jail category is the
                 * only category Jailed members
                 * are allowed to see.
                 */

                if (
                    category.id ===
                    jail.categoryId
                ) {

                    await category.permissionOverwrites.edit(
                        role,
                        {
                            ViewChannel: true,
                            ReadMessageHistory: true,
                            SendMessages: true
                        }
                    );

                } else {

                    /*
                     * Hide every other category
                     * from the Jailed role.
                     *
                     * Existing permissions for
                     * other roles are untouched.
                     */

                    await category.permissionOverwrites.edit(
                        role,
                        {
                            ViewChannel: false
                        }
                    );

                }

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
     * Make the jail channel inherit
     * the Jail category permissions.
     */

    async syncJailChannel(
        guild
    ) {

        const setup =
            await this.getSetup(
                guild
            );

        if (!setup) {
            return false;
        }

        const {
            jail
        } = setup;

        const channel =
            guild.channels.cache.get(
                jail.channelId
            );

        if (!channel) {
            return false;
        }

        try {

            await channel.lockPermissions();

            return true;

        } catch (error) {

            console.error(
                "[JAIL] Failed to sync jail channel:",
                error
            );

            return false;
        }

    },


    /*
     * Make the jail logs channel inherit
     * the category permissions first,
     * then hide it from the Jailed role.
     */

    async syncLogChannel(
        guild
    ) {

        const setup =
            await this.getSetup(
                guild
            );

        if (!setup) {
            return false;
        }

        const {
            jail,
            role
        } = setup;

        const channel =
            guild.channels.cache.get(
                jail.logChannelId
            );

        if (!channel) {
            return false;
        }

        try {

            await channel.lockPermissions();

            await channel.permissionOverwrites.edit(
                role,
                {
                    ViewChannel: false
                }
            );

            return true;

        } catch (error) {

            console.error(
                "[JAIL] Failed to sync jail logs:",
                error
            );

            return false;
        }

    },


    /*
     * Full jail permission synchronization.
     */

    async sync(
        guild
    ) {

        if (!guild) {
            return false;
        }

        const setup =
            await this.getSetup(
                guild
            );

        if (!setup) {
            return false;
        }

        /*
         * Apply Jailed permissions to
         * every category first.
         */

        await this.syncCategories(
            guild
        );

        /*
         * Jail channel inherits from
         * Jail category.
         */

        await this.syncJailChannel(
            guild
        );

        /*
         * Jail logs inherit from the
         * category, then are hidden
         * from Jailed.
         */

        await this.syncLogChannel(
            guild
        );

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
