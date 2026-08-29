// src/events/channelCreate.js

const {
    ChannelType
} = require("discord.js");

const Jail =
    require("../models/Jail");

module.exports = {

    name: "channelCreate",

    async execute(
        client,
        channel
    ) {

        /*
         * Guild channels only.
         */

        if (!channel.guild) {
            return;
        }

        try {

            /*
             * Get jail setup.
             */

            const jail =
                await Jail.findOne({
                    guildId:
                        channel.guild.id
                });

            /*
             * No jail system configured.
             */

            if (!jail) {
                return;
            }

            /*
             * Get Jailed role.
             */

            const jailRole =
                channel.guild.roles.cache.get(
                    jail.roleId
                );

            if (!jailRole) {
                return;
            }

            /*
             * Get all channels/categories.
             *
             * This makes sure channels that existed
             * BEFORE this channel was created are
             * also synchronized.
             */

            const channels =
                channel.guild.channels.cache;

            /*
             * Synchronize every channel/category.
             */

            for (
                const currentChannel
                of channels.values()
            ) {

                /*
                 * Jail category does not exist as
                 * a special category anymore.
                 *
                 * Only the two jail channels are
                 * treated specially.
                 */

                /*
                 * Categories
                 *
                 * Jailed cannot see normal categories.
                 */

                if (
                    currentChannel.type ===
                    ChannelType.GuildCategory
                ) {

                    await currentChannel.permissionOverwrites
                        .edit(
                            jailRole,
                            {
                                ViewChannel: false
                            }
                        )
                        .catch(error => {

                            console.error(
                                `[JAIL] Failed to sync category ${currentChannel.id}:`,
                                error
                            );

                        });

                    continue;
                }

                /*
                 * Jail channel
                 *
                 * Jailed members can access it.
                 */

                if (
                    currentChannel.id ===
                    jail.channelId
                ) {

                    await currentChannel.permissionOverwrites
                        .edit(
                            channel.guild.roles.everyone,
                            {
                                ViewChannel: false
                            }
                        )
                        .catch(error => {

                            console.error(
                                `[JAIL] Failed to hide jail channel ${currentChannel.id}:`,
                                error
                            );

                        });

                    await currentChannel.permissionOverwrites
                        .edit(
                            jailRole,
                            {
                                ViewChannel: true,
                                SendMessages: true,
                                ReadMessageHistory: true
                            }
                        )
                        .catch(error => {

                            console.error(
                                `[JAIL] Failed to allow Jailed role in jail channel ${currentChannel.id}:`,
                                error
                            );

                        });

                    continue;
                }

                /*
                 * Jail logs channel
                 *
                 * Hidden from @everyone and Jailed.
                 */

                if (
                    currentChannel.id ===
                    jail.logChannelId
                ) {

                    await currentChannel.permissionOverwrites
                        .edit(
                            channel.guild.roles.everyone,
                            {
                                ViewChannel: false
                            }
                        )
                        .catch(error => {

                            console.error(
                                `[JAIL] Failed to hide jail logs ${currentChannel.id}:`,
                                error
                            );

                        });

                    await currentChannel.permissionOverwrites
                        .edit(
                            jailRole,
                            {
                                ViewChannel: false
                            }
                        )
                        .catch(error => {

                            console.error(
                                `[JAIL] Failed to hide jail logs from Jailed ${currentChannel.id}:`,
                                error
                            );

                        });

                    continue;
                }

                /*
                 * Every normal channel.
                 *
                 * Hide it from Jailed.
                 *
                 * IMPORTANT:
                 * Only the Jailed role overwrite is
                 * changed. Everyone/staff/bot/etc.
                 * permissions are untouched.
                 */

                await currentChannel.permissionOverwrites
                    .edit(
                        jailRole,
                        {
                            ViewChannel: false
                        }
                    )
                    .catch(error => {

                        console.error(
                            `[JAIL] Failed to sync channel ${currentChannel.id}:`,
                            error
                        );

                    });

            }

        } catch (error) {

            console.error(
                "[JAIL] Failed to automatically synchronize channels:",
                error
            );

        }

    }

};
