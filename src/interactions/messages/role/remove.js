const Embed =
    require("../../../models/Embed");

module.exports = {

    name: "roleRemove",

    type: "button",

    async execute(
        client,
        interaction
    ) {

        if (!interaction.guild) {
            return;
        }

        const parts =
            interaction.customId.split(":");

        const name =
            parts[1];

        const roleId =
            parts[2];

        if (
            !name ||
            !roleId
        ) {

            return interaction.reply({
                content:
                    "Invalid role configuration.",
                flags: 64
            });

        }

        try {

            const saved =
                await Embed.findOne({
                    guildId:
                        interaction.guild.id,

                    name
                });

            if (!saved) {

                return interaction.reply({
                    content:
                        `I couldn't find the embed **${name}**.`,
                    flags: 64
                });

            }

            if (
                !Array.isArray(
                    saved.components
                )
            ) {

                return interaction.reply({
                    content:
                        "No role selector has been configured yet.",
                    flags: 64
                });

            }

            let removed =
                false;

            for (
                const component
                of saved.components
            ) {

                if (
                    component?.type !== 1 ||
                    !Array.isArray(
                        component.components
                    )
                ) {
                    continue;
                }

                for (
                    const select
                    of component.components
                ) {

                    if (
                        select?.type !== 3 ||
                        select.custom_id !==
                            `roleSelect:${name}` ||
                        !Array.isArray(
                            select.options
                        )
                    ) {
                        continue;
                    }

                    const originalLength =
                        select.options.length;

                    select.options =
                        select.options.filter(
                            option =>
                                option?.value !==
                                roleId
                        );

                    if (
                        select.options.length !==
                        originalLength
                    ) {

                        removed =
                            true;

                        select.max_values =
                            Math.max(
                                1,
                                Math.min(
                                    select.max_values || 1,
                                    select.options.length
                                )
                            );

                    }

                }

            }

            if (!removed) {

                return interaction.reply({
                    content:
                        "That role is not currently in the selector.",
                    flags: 64
                });

            }

            saved.components =
                saved.components.filter(
                    component => {

                        if (
                            component?.type !== 1 ||
                            !Array.isArray(
                                component.components
                            )
                        ) {
                            return true;
                        }

                        return component.components.some(
                            select =>
                                select?.type !== 3 ||
                                select.custom_id !==
                                    `roleSelect:${name}` ||
                                Array.isArray(
                                    select.options
                                ) &&
                                select.options.length
                        );

                    }
                );

            saved.markModified(
                "components"
            );

            await saved.save();

            return interaction.reply({

                content:
                    `Removed the role from the selector for **${name}**.`,

                flags: 64

            });

        } catch (error) {

            console.error(
                "[ROLE REMOVE]",
                error
            );

            return interaction.reply({

                content:
                    "I couldn't remove that role from the selector.",

                flags: 64

            });

        }

    }

};
