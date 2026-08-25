const {
    EmbedBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ActionRowBuilder
} = require("discord.js");

const config = require("../../config");

const rolesInteraction =
    require("./embedroles");

module.exports = {

    type: "select",

    name: "embed_role_apply",

    async execute(interaction) {

        const parts =
            interaction.customId.split(":");

        const creatorId =
            parts[1];


        // =========================
        // SERVER CHECK
        // =========================

        if (!interaction.guild) {

            const embed =
                new EmbedBuilder()
                    .setColor(
                        config.colors.failed
                    )
                    .setDescription(
                        `${config.emojis.failed} ${interaction.client.user}: This interaction can only be used in a server.`
                    );

            return interaction.reply({
                embeds: [embed],
                flags: 64
            });
        }


        // =========================
        // GET SAVED ROLES
        // =========================

        const roleData =
            rolesInteraction.roleData;

        const savedRoles =
            roleData.get(creatorId) || [];


        // =========================
        // NO ROLES
        // =========================

        if (!savedRoles.length) {

            const embed =
                new EmbedBuilder()
                    .setColor(
                        config.colors.failed
                    )
                    .setDescription(
                        `${config.emojis.failed} ${interaction.client.user}: There are no configured roles.`
                    );

            return interaction.reply({
                embeds: [embed],
                flags: 64
            });
        }


        // =========================
        // APPLY ROLES
        // =========================

        for (const roleId of interaction.values) {

            const role =
                interaction.guild.roles.cache.get(
                    roleId
                );

            if (!role) {
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

                } else {

                    await interaction.member.roles.add(
                        role
                    );

                }

            } catch (error) {

                console.error(
                    `[EMBED ROLES] Failed to update role ${role.id}:`,
                    error
                );

            }
        }


        // =========================
        // UPDATED
        // =========================

        const embed =
            new EmbedBuilder()
                .setColor(
                    config.colors.success
                )
                .setDescription(
                    `${config.emojis.success} ${interaction.client.user}: Your roles have been updated.`
                );


        return interaction.reply({

            embeds: [
                embed
            ],

            flags: 64

        });

    }

};
