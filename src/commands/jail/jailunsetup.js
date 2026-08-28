// src/commands/jail/jailunsetup.js

const {
    PermissionFlagsBits
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
         * Delete jail channel
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
         * Delete jail logs channel
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
         * Delete jail category
         */

        const category =
            message.guild.channels.cache.get(
                jail.categoryId
            );

        if (category) {

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
         * Delete Jailed role
         */

        const jailRole =
            message.guild.roles.cache.get(
                jail.roleId
            );

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
         * Remove MongoDB configuration
         */

        await Jail.deleteOne({
            guildId:
                message.guild.id
        });

        /*
         * Success
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
