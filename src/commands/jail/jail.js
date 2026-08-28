const {
    PermissionFlagsBits
} = require("discord.js");

const Jail =
    require("../../../models/Jail");

const globalEmbeds =
    require("../../../embeds/global");

const jailEmbeds =
    require("../../../embeds/jail");

module.exports = {

    name: "jail",

    aliases: [],

    permissions: {
        user: ["ManageGuild"],
        bot: ["ManageRoles"]
    },

    async execute(
        client,
        message,
        args
    ) {

        if (!message.guild) {
            return;
        }

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

        const jail =
            await Jail.findOne({
                guildId:
                    message.guild.id
            });

        if (!jail) {
            return message.channel.send({
                embeds: [
                    jailEmbeds.noSetup(
                        message.author
                    )
                ]
            });
        }

        const target =
            message.mentions.members.first() ||
            await message.guild.members.fetch(
                args[0]
            ).catch(() => null);

        if (!target) {
            return;
        }

        if (
            target.id === message.author.id
        ) {
            return;
        }

        if (
            target.id === client.user.id
        ) {
            return;
        }

        const memberRecord =
            jail.members.find(
                member =>
                    member.userId === target.id
            );

        if (memberRecord) {
            return message.channel.send({
                embeds: [
                    jailEmbeds.alreadyJailed(
                        message.author,
                        target
                    )
                ]
            });
        }

        /*
         * Moderator hierarchy
         */

        if (
            target.roles.highest.position >=
            message.member.roles.highest.position
        ) {
            return message.channel.send({
                embeds: [
                    jailEmbeds.hierarchy(
                        message.author,
                        target
                    )
                ]
            });
        }

        /*
         * Bot hierarchy
         */

        if (
            target.roles.highest.position >=
            message.guild.members.me.roles.highest.position
        ) {
            return message.channel.send({
                embeds: [
                    jailEmbeds.botHierarchy(
                        message.author,
                        target
                    )
                ]
            });
        }

        const jailRole =
            message.guild.roles.cache.get(
                jail.roleId
            );

        if (!jailRole) {
            return message.channel.send({
                embeds: [
                    jailEmbeds.noSetup(
                        message.author
                    )
                ]
            });
        }

        if (!jailRole.editable) {
            return message.channel.send({
                embeds: [
                    jailEmbeds.botHierarchy(
                        message.author,
                        target
                    )
                ]
            });
        }

        /*
         * Save current roles.
         *
         * @everyone is never saved.
         */

        const roles =
            target.roles.cache
                .filter(
                    role =>
                        role.id !==
                        message.guild.id
                )
                .map(
                    role =>
                        role.id
                );

        const reason =
            args
                .slice(
                    message.mentions.members.first()
                        ? 1
                        : 1
                )
                .join(" ") ||
            "No reason provided";

        /*
         * Remove manageable roles
         */

        try {

            await target.roles.set(
                [jailRole.id],
                "Jailed"
            );

        } catch (error) {

            console.error(
                "[JAIL] Failed to assign jail role:",
                error
            );

            return;
        }

        /*
         * Save jail record
         */

        jail.members.push({
            userId:
                target.id,

            roles:
                roles,

            reason:
                reason,

            jailedAt:
                new Date()
        });

        await jail.save();

        /*
         * User-facing response
         */

        return message.channel.send({
            embeds: [
                jailEmbeds.jailed(
                    message.author,
                    target,
                    reason
                )
            ]
        });

    }

};
