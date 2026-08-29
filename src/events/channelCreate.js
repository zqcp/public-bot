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
             * New category.
             *
             * Hide the category from
             * the Jailed role.
             */

            if (
                channel.type ===
                ChannelType.GuildCategory
            ) {

                await channel.permissionOverwrites.edit(
                    jailRole,
                    {
                        ViewChannel: false
                    }
                );

                return;
            }

            /*
             * Jail channel.
             */

            if (
                channel.id ===
                jail.channelId
            ) {

                await channel.permissionOverwrites.edit(
                    channel.guild.roles.everyone,
                    {
                        ViewChannel: false
                    }
                );

                await channel.permissionOverwrites.edit(
                    jailRole,
                    {
                        ViewChannel: true,
                        SendMessages: true,
                        ReadMessageHistory: true
                    }
                );

                return;
            }

            /*
             * Jail logs channel.
             */

            if (
                channel.id ===
                jail.logChannelId
            ) {

                await channel.permissionOverwrites.edit(
                    channel.guild.roles.everyone,
                    {
                        ViewChannel: false
                    }
                );

                await channel.permissionOverwrites.edit(
                    jailRole,
                    {
                        ViewChannel: false
                    }
                );

                return;
            }

            /*
             * Normal newly-created channel.
             *
             * Hide it from Jailed.
             *
             * Existing permissions for
             * everyone/staff/etc. are untouched.
             */

            await channel.permissionOverwrites.edit(
                jailRole,
                {
                    ViewChannel: false
                }
            );

        } catch (error) {

            console.error(
                "[JAIL] Failed to automatically sync new channel:",
                error
            );

        }

    }

};
