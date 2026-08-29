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
             * Get jail configuration.
             */

            const jail =
                await Jail.findOne({
                    guildId:
                        channel.guild.id
                });

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
             * NEW CATEGORY
             *
             * Hide the category from Jailed.
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
             * NEW JAIL CHANNEL
             *
             * Allow Jailed members to access it.
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
             * NEW JAIL LOG CHANNEL
             *
             * Hide it from everyone and Jailed.
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
             * ANY OTHER NEW CHANNEL
             *
             * Hide it from Jailed.
             *
             * Only the Jailed role overwrite
             * is modified. Existing permissions
             * for everyone, staff, bots, etc.
             * are left alone.
             */

            await channel.permissionOverwrites.edit(
                jailRole,
                {
                    ViewChannel: false
                }
            );

        } catch (error) {

            console.error(
                "[JAIL] Failed to sync newly created channel:",
                error
            );

        }

    }

};
