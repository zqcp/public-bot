const {
    PermissionFlagsBits
} = require("discord.js");

const Embed =
    require("../../models/Embed");


module.exports = {

    name: "roleSelect",

    type: "selectMenu",

    async execute(
        client,
        interaction
    ) {

        if (!interaction.guild) {
            return;
        }

        const values =
            interaction.values || [];

        if (!values.length) {
            return;
        }

        const member =
            interaction.member;

        if (!member) {
            return;
        }

        const saved =
            await Embed.findOne({
                guildId:
                    interaction.guild.id,

                "components.custom_id":
                    interaction.customId
            }).lean();

        if (!saved) {

            return interaction.reply({
                content:
                    "I couldn't find this role selector.",
                flags: 64
            });

        }

        const selector =
            Array.isArray(saved.components)
                ? saved.components.find(
                    component =>
                        component?.type === 3 &&
                        component.custom_id ===
                            interaction.customId
                )
                : null;

        if (!selector) {

            return interaction.reply({
                content:
                    "I couldn't find this role selector.",
                flags: 64
            });

        }

        const roles =
            values
                .map(
                    roleId =>
                        interaction.guild.roles.cache.get(
                            roleId
                        )
                )
                .filter(
                    role =>
                        role &&
                        !role.managed
                );

        if (!roles.length) {

            return interaction.reply({
                content:
                    "I couldn't find any valid roles from your selection.",
                flags: 64
            });

        }

        const botMember =
            interaction.guild.members.me;

        if (!botMember) {

            return interaction.reply({
                content:
                    "I couldn't determine my server member.",
                flags: 64
            });

        }

        const manageableRoles =
            roles.filter(
                role =>
                    role.position <
                    botMember.roles.highest.position
            );

        if (!manageableRoles.length) {

            return interaction.reply({
                content:
                    "I cannot manage any of the selected roles.",
                flags: 64
            });

        }

        const added = [];
        const removed = [];

        for (
            const role
            of manageableRoles
        ) {

            if (
                member.roles.cache.has(
                    role.id
                )
            ) {

                await member.roles.remove(
                    role
                );

                removed.push(
                    role
                );

            } else {

                await member.roles.add(
                    role
                );

                added.push(
                    role
                );

            }

        }

        const changes = [];

        if (added.length) {

            changes.push(
                `Added ${added.map(
                    role =>
                        `<@&${role.id}>`
                ).join(", ")}`
            );

        }

        if (removed.length) {

            changes.push(
                `Removed ${removed.map(
                    role =>
                        `<@&${role.id}>`
                ).join(", ")}`
            );

        }

        return interaction.reply({

            content:
                changes.join("\n") ||
                "Your roles have been updated.",

            flags: 64

        });

    }

};
