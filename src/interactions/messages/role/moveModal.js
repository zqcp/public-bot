const Embed =
    require("../../../models/Embed");

module.exports = {

    name: "roleMoveModal",

    type: "modal",

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

        const position =
            Number(
                interaction.fields
                    .getTextInputValue(
                        "position"
                    )
                    .trim()
            );

        if (
            !Number.isInteger(position) ||
            position < 1 ||
            position > 25
        ) {

            return interaction.reply({
                content:
                    "Please provide a valid selector position from **1 to 25**.",
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

            let menu =
                null;

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

                menu =
                    component.components.find(
                        select =>
                            select?.type === 3 &&
                            select.custom_id ===
                                `roleSelect:${name}`
                    );

                if (menu) {
                    break;
                }

            }

            if (
                !menu ||
                !Array.isArray(
                    menu.options
                )
            ) {

                return interaction.reply({
                    content:
                        "No role selector has been configured yet.",
                    flags: 64
                });

            }

            const currentIndex =
                menu.options.findIndex(
                    option =>
                        option?.value ===
                        roleId
                );

            if (
                currentIndex === -1
            ) {

                return interaction.reply({
                    content:
                        "That role is not currently in the selector.",
                    flags: 64
                });

            }

            const newIndex =
                position - 1;

            const [
                option
            ] =
                menu.options.splice(
                    currentIndex,
                    1
                );

            menu.options.splice(
                Math.min(
                    newIndex,
                    menu.options.length
                ),
                0,
                option
            );

            saved.markModified(
                "components"
            );

            await saved.save();

            return interaction.reply({

                content:
                    `Moved **${option.label}** to selector position **${newIndex + 1}**.`,

                flags: 64

            });

        } catch (error) {

            console.error(
                "[ROLE MOVE]",
                error
            );

            return interaction.reply({

                content:
                    "I couldn't move that role in the selector.",

                flags: 64

            });

        }

    }

};
