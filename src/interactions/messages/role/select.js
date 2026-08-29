const {
    StringSelectMenuOptionBuilder
} = require("discord.js");

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

        const member =
            interaction.member;

        const selected =
            interaction.values;

        const roles =
            selected
                .map(id =>
                    interaction.guild.roles.cache.get(id)
                )
                .filter(Boolean);

        if (!roles.length) {
            return interaction.reply({
                content:
                    "No valid roles were selected.",
                flags: 64
            });
        }

        const added = [];
        const removed = [];

        for (const role of roles) {

            if (
                member.roles.cache.has(
                    role.id
                )
            ) {

                await member.roles.remove(
                    role
                );

                removed.push(
                    role.name
                );

            } else {

                await member.roles.add(
                    role
                );

                added.push(
                    role.name
                );

            }

        }

        const changes = [];

        if (added.length) {
            changes.push(
                `Added: ${added.join(", ")}`
            );
        }

        if (removed.length) {
            changes.push(
                `Removed: ${removed.join(", ")}`
            );
        }

        return interaction.reply({
            content:
                changes.join("\n") ||
                "No roles were changed.",
            flags: 64
        });

    }

};
