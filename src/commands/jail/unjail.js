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

    name: "unjail",

    aliases: ["unj"],

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

        const recordIndex =
            jail.members.findIndex(
                member =>
                    member.userId ===
                    target.id
            );

        if (
            recordIndex === -1
        ) {
            return message.channel.send({
                embeds: [
                    jailEmbeds.notJailed(
                        message.author,
                        target
                    )
                ]
            });
        }

        const record =
            jail.members[
                recordIndex
            ];

        /*
         * Restore previous roles.
         *
         * Only restore roles that still exist
         * and that the bot can manage.
         */

        const rolesToRestore =
            record.roles
                .map(
                    roleId =>
                        message.guild.roles.cache.get(
                            roleId
                        )
                )
                .filter(
                    role =>
                        role &&
                        role.editable
                )
                .map(
                    role =>
                        role.id
                );

        try {

            await target.roles.set(
                rolesToRestore,
                "Unjailed"
            );

        } catch (error) {

            console.error(
                "[JAIL] Failed to restore roles:",
                error
            );

            return;
        }

        /*
         * Remove jail record
         */

        jail.members.splice(
            recordIndex,
            1
        );

        await jail.save();

        return message.channel.send({
            embeds: [
                jailEmbeds.unjailed(
                    message.author,
                    target
                )
            ]
        });

    }

};
