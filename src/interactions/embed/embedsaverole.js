const {
    EmbedBuilder
} = require("discord.js");

const config = require("../../config");

const rolesInteraction =
    require("./embedroles");


module.exports = {

    type: "button",

    name: "embed_role_save",

    async execute(interaction) {

        const parts =
            interaction.customId.split(":");

        const creatorId =
            parts[1];


        // =========================
        // OWNER CHECK
        // =========================

        if (
            creatorId &&
            interaction.user.id !== creatorId
        ) {

            const embed =
                new EmbedBuilder()
                    .setColor(
                        config.colors.failed
                    )
                    .setDescription(
                        `${config.emojis.failed} ${interaction.client.user}: You can't edit this embed because you didn't create it.`
                    );

            return interaction.reply({

                embeds: [
                    embed
                ],

                flags: 64

            });
        }


        // =========================
        // GET SAVED ROLES
        // =========================

        const roleData =
            rolesInteraction.roleData;

        const savedRoles =
            roleData.get(
                creatorId
            ) || [];


        // =========================
        // CHECK ROLES
        // =========================

        if (!savedRoles.length) {

            const embed =
                new EmbedBuilder()
                    .setColor(
                        config.colors.failed
                    )
                    .setDescription(
                        `${config.emojis.failed} ${interaction.client.user}: You haven't added any roles yet.`
                    );

            return interaction.reply({

                embeds: [
                    embed
                ],

                flags: 64

            });
        }


        // =========================
        // SAVE SUCCESS
        // =========================

        const embed =
            new EmbedBuilder()
                .setColor(
                    config.colors.success
                )
                .setDescription(
                    `${config.emojis.success} ${interaction.client.user}: Your roles have been saved.`
                );


        return interaction.update({

            embeds: [
                embed
            ],

            components: []

        });

    }

};
