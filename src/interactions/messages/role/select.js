const {
    PermissionFlagsBits
} = require("discord.js");

const Embed =
    require("../../../models/Embed");


module.exports = {

    name: "roleSelect",

    type: "select",

    async execute(
        client,
        interaction
    ) {

        if (!interaction.guild) {
            return;
        }

        const selectedRoles =
            interaction.values || [];

        if (!selectedRoles.length) {
            return;
        }


        /*
         * FIND THE EMBED NAME
         *
         * roleSelect:<embedName>
         */

        const parts =
            interaction.customId.split(":");

        const name =
            parts.slice(1).join(":");


        if (!name) {
            return interaction.reply({
                content:
                    "I couldn't determine which role selector you're using.",
                flags: 64
            });
        }


        /*
         * LOAD EMBED
         */

        const saved =
            await Embed.findOne({
                guildId:
                    interaction.guild.id,

                name
            }).lean();

        if (!saved) {
            return interaction.reply({
                content:
                    "I couldn't find the embed connected to this role selector.",
                flags: 64
            });
        }


        /*
         * FIND THE SELECTOR
         *
         * Action Row
         * └── String Select
         */

        const components =
            Array.isArray(
                saved.components
            )
                ? saved.components
                : [];

        const row =
            components.find(
                component =>
                    component?.type === 1 &&
                    Array.isArray(
                        component.components
                    ) &&
                    component.components.some(
                        select =>
                            select?.type === 3 &&
                            select.custom_id ===
                                interaction.customId
                    )
            );

        if (!row) {
            return interaction.reply({
                content:
                    "I couldn't find this role selector.",
                flags: 64
            });
        }


        const selector =
            row.components.find(
                component =>
                    component?.type === 3 &&
                    component.custom_id ===
                        interaction.customId
            );

        if (!selector) {
            return interaction.reply({
                content:
                    "I couldn't find this role selector.",
                flags: 64
            });
        }


        /*
         * MAKE SURE THE USER CAN MANAGE
         * THE ROLES THEY ARE SELECTING.
         */

        const member =
            interaction.member;

        const botMember =
            interaction.guild.members.me;

        if (!member || !botMember) {
            return interaction.reply({
                content:
                    "I couldn't determine the server members.",
                flags: 64
            });
        }


        /*
         * ASSIGN SELECTED ROLES
         */

        const added = [];
        const failed = [];


        for (
            const roleId of selectedRoles
        ) {

            const role =
                interaction.guild.roles.cache.get(
                    roleId
                );

            if (!role) {
                failed.push(
                    roleId
                );
                continue;
            }


            /*
             * Never allow managed roles.
             */

            if (
                role.managed
            ) {
                failed.push(
                    role.name
                );
                continue;
            }


            /*
             * The bot must be able to
             * manage the role.
             */

            if (
                role.position >=
                botMember.roles.highest.position
            ) {
                failed.push(
                    role.name
                );
                continue;
            }


            /*
             * Add the role if the member
             * does not already have it.
             */

            if (
                !member.roles.cache.has(
                    role.id
                )
            ) {

                try {

                    await member.roles.add(
                        role
                    );

                    added.push(
                        role.name
                    );

                } catch (error) {

                    console.error(
                        "[ROLE SELECT] Failed to add role:",
                        error
                    );

                    failed.push(
                        role.name
                    );

                }

            }

        }


        /*
         * RESPONSE
         */

        if (added.length) {

            return interaction.reply({

                content:
                    `Roles added: **${added.join(", ")}**` +
                    (
                        failed.length
                            ? `\n\nCould not add: **${failed.join(", ")}**`
                            : ""
                    ),

                flags: 64

            });

        }


        if (failed.length) {

            return interaction.reply({

                content:
                    `I couldn't add: **${failed.join(", ")}**`,

                flags: 64

            });

        }


        return interaction.reply({

            content:
                "You already have all of those roles.",

            flags: 64

        });

    }

};
