const {
    PermissionFlagsBits
} = require("discord.js");

const Embed =
    require("../../../models/Embed");

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

        const name =
            interaction.customId.split(":")[1];

        if (!name) {

            return interaction.reply({
                content:
                    "Invalid role selector.",
                flags: 64
            });

        }

        const saved =
            await Embed.findOne({
                guildId:
                    interaction.guild.id,

                name
            }).lean();

        if (!saved) {

            return interaction.reply({
                content:
                    "I couldn't find that embed.",
                flags: 64
            });

        }

        const selectedRoles =
            interaction.values || [];

        if (!selectedRoles.length) {
            return;
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

        const added = [];
        const removed = [];
        const failed = [];

        for (
            const roleId of selectedRoles
        ) {

            const role =
                interaction.guild.roles.cache.get(
                    roleId
                );

            if (!role) {
                continue;
            }

            if (role.managed) {

                failed.push(
                    role.name
                );

                continue;
            }

            if (
                role.position >=
                botMember.roles.highest.position
            ) {

                failed.push(
                    role.name
                );

                continue;
            }

            try {

                if (
                    interaction.member.roles.cache.has(
                        role.id
                    )
                ) {

                    await interaction.member.roles.remove(
                        role
                    );

                    removed.push(
                        role.name
                    );

                } else {

                    await interaction.member.roles.add(
                        role
                    );

                    added.push(
                        role.name
                    );

                }

            } catch (error) {

                console.error(
                    `[ROLE SELECT] Failed to toggle ${role.id}:`,
                    error
                );

                failed.push(
                    role.name
                );

            }

        }

        const lines = [];

        if (added.length) {

            lines.push(
                `Added: ${added.map(
                    role => `**${role}**`
                ).join(", ")}`
            );

        }

        if (removed.length) {

            lines.push(
                `Removed: ${removed.map(
                    role => `**${role}**`
                ).join(", ")}`
            );

        }

        if (failed.length) {

            lines.push(
                `Failed: ${failed.map(
                    role => `**${role}**`
                ).join(", ")}`
            );

        }

        return interaction.reply({

            content:
                lines.length
                    ? lines.join("\n")
                    : "I couldn't change those roles.",

            flags: 64

        });

    }

};
