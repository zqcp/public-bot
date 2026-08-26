const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");
const editor = require("../../systems/messages/editor");

module.exports = {

    name: "embedSelectMenuEditModal",

    type: "modal",

    async execute(client, interaction) {

        if (!interaction.guild) {
            return;
        }

        const parts =
            interaction.customId.split(":");

        const name =
            parts[1];

        const type =
            parts[2];

        const rowIndex =
            Number(parts[3]);

        const componentIndex =
            Number(parts[4]);

        if (
            !name ||
            !type ||
            Number.isNaN(rowIndex) ||
            Number.isNaN(componentIndex)
        ) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "I couldn't determine which select menu you're editing."
                    )
                ],
                flags: 64
            });
        }

        const saved =
            await Embed.findOne({
                guildId: interaction.guild.id,
                name
            });

        if (!saved) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        `I couldn't find an embed named **${name}**.`
                    )
                ],
                flags: 64
            });
        }

        const component =
            saved.components?.[rowIndex]
                ?.components?.[componentIndex];

        if (!component) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "I couldn't find that select menu."
                    )
                ],
                flags: 64
            });
        }

        const placeholder =
            interaction.fields
                .getTextInputValue("placeholder")
                .trim();

        const disabledInput =
            interaction.fields
                .getTextInputValue("disabled")
                .trim()
                .toLowerCase();

        if (
            disabledInput &&
            disabledInput !== "true" &&
            disabledInput !== "false"
        ) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "Disabled must be either `true` or `false`."
                    )
                ],
                flags: 64
            });
        }

        /*
         * ROLE SELECT
         *
         * Role selects are stored as String Selects
         * (type 3) with the role ID inside the option
         * value.
         */
        if (type === "role") {

            const roleName =
                interaction.fields
                    .getTextInputValue("roleName")
                    .trim();

            const roleId =
                interaction.fields
                    .getTextInputValue("roleId")
                    .trim()
                    .replace(
                        /[<@&>]/g,
                        ""
                    );

            if (!roleName || !roleId) {
                return interaction.reply({
                    embeds: [
                        embeds.error(
                            interaction.user,
                            "Role name and role are required."
                        )
                    ],
                    flags: 64
                });
            }

            const role =
                interaction.guild.roles.cache.get(
                    roleId
                );

            if (!role) {
                return interaction.reply({
                    embeds: [
                        embeds.error(
                            interaction.user,
                            "I couldn't find that role."
                        )
                    ],
                    flags: 64
                });
            }

            if (
                component.type !== 3 ||
                !Array.isArray(component.options) ||
                !component.options.length
            ) {
                return interaction.reply({
                    embeds: [
                        embeds.error(
                            interaction.user,
                            "That component isn't a valid role select."
                        )
                    ],
                    flags: 64
                });
            }

            if (placeholder) {
                component.placeholder =
                    placeholder;
            }

            component.options[0].label =
                roleName;

            component.options[0].value =
                role.id;

            component.disabled =
                disabledInput === "true";

        } else {

            /*
             * OTHER SELECT MENUS
             */

            const customId =
                interaction.fields
                    .getTextInputValue("customId")
                    .trim();

            if (placeholder) {
                component.placeholder =
                    placeholder;
            }

            if (customId) {
                component.custom_id =
                    customId;
            }

            component.disabled =
                disabledInput === "true";
        }

        saved.markModified(
            "components"
        );

        await saved.save();

        await editor.updateMessage(
            client,
            interaction.guild.id,
            name
        );

        return interaction.reply({
            embeds: [
                embeds.success(
                    interaction.user,
                    `The ${type} select menu in **${name}** has been updated.`
                )
            ],
            flags: 64
        });

    }

};
