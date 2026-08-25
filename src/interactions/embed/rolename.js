const {
    EmbedBuilder
} = require("discord.js");

const config = require("../../config");

const rolesInteraction =
    require("./embedroles");


module.exports = {

    type: "modal",

    name: "embed_role_name",

    async execute(interaction) {

        const parts =
            interaction.customId.split(":");

        const creatorId =
            parts[1];

        const roleId =
            parts[2];


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
        // GET CUSTOM NAME
        // =========================

        const name =
            interaction.fields
                .getTextInputValue(
                    "role_name"
                )
                .trim();


        if (!name) {

            const embed =
                new EmbedBuilder()
                    .setColor(
                        config.colors.failed
                    )
                    .setDescription(
                        `${config.emojis.failed} ${interaction.client.user}: You need to enter a name.`
                    );

            return interaction.reply({

                embeds: [
                    embed
                ],

                flags: 64

            });
        }


        // =========================
        // GET ROLE DATA
        // =========================

        const roleData =
            rolesInteraction.roleData;


        if (!roleData.has(creatorId)) {

            roleData.set(
                creatorId,
                []
            );

        }


        const savedRoles =
            roleData.get(
                creatorId
            );


        // =========================
        // CHECK DUPLICATE
        // =========================

        const exists =
            savedRoles.some(
                item =>
                    item.roleId === roleId
            );


        if (exists) {

            const embed =
                new EmbedBuilder()
                    .setColor(
                        config.colors.failed
                    )
                    .setDescription(
                        `${config.emojis.failed} ${interaction.client.user}: That role has already been added.`
                    );

            return interaction.reply({

                embeds: [
                    embed
                ],

                flags: 64

            });
        }


        // =========================
        // SAVE
        // =========================

        savedRoles.push({

            name: name,

            roleId: roleId

        });


        // =========================
        // SUCCESS
        // =========================

        const embed =
            new EmbedBuilder()
                .setColor(
                    config.colors.success
                )
                .setDescription(
                    `${config.emojis.success} ${interaction.client.user}: **${name}** has been added.`
                );


        return interaction.reply({

            embeds: [
                embed
            ],

            flags: 64

        });

    }

};
