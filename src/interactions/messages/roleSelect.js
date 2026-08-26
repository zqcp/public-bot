const config = require("../../config");
const messages = require("../../systems/messages/interaction");

module.exports = {

    name: "role-select",

    type: "select",

    async execute(interaction) {

        if (!interaction.guild) {

            return messages.reply(
                interaction,
                {
                    content:
                        `${config.emojis.error} ${interaction.user}: this can only be used in a server.`
                }
            );

        }

        const member =
            interaction.member;

        if (!member) {

            return messages.reply(
                interaction,
                {
                    content:
                        `${config.emojis.failed} ${interaction.user}: I couldn't find your member information.`
                }
            );

        }

        const roleIds =
            interaction.values || [];

        if (!roleIds.length) {

            return messages.reply(
                interaction,
                {
                    content:
                        `${config.emojis.failed} ${interaction.user}: no roles were selected.`
                }
            );

        }

        const addedRoles = [];
        const failedRoles = [];

        for (const roleId of roleIds) {

            const role =
                interaction.guild.roles.cache.get(
                    roleId
                );

            if (!role) {
                failedRoles.push(roleId);
                continue;
            }

            // Bot cannot manage @everyone or roles
            // above/equal to its highest role.
            const botMember =
                interaction.guild.members.me;

            if (
                role.id ===
                interaction.guild.id ||
                !botMember ||
                role.position >=
                botMember.roles.highest.position
            ) {

                failedRoles.push(
                    role.id
                );

                continue;
            }

            try {

                if (
                    !member.roles.cache.has(
                        role.id
                    )
                ) {

                    await member.roles.add(
                        role
                    );

                    addedRoles.push(
                        role
                    );

                } else {

                    addedRoles.push(
                        role
                    );

                }

            } catch (error) {

                console.error(
                    `[ROLE SELECT] Failed to add ${role.id}:`,
                    error
                );

                failedRoles.push(
                    role.id
                );

            }

        }

        if (!addedRoles.length) {

            return messages.reply(
                interaction,
                {
                    content:
                        `${config.emojis.failed} ${interaction.user}: your roles could not be updated.`
                }
            );

        }

        return messages.reply(
            interaction,
            {
                content:
                    `${config.emojis.success} ${interaction.user}: your roles have been updated.`
                }
            );

    }

};
