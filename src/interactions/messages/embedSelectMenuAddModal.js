const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");
const editor = require("../../systems/messages/editor");

module.exports = {

    name: "embedSelectMenuAddModal",

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

        if (!name || !type) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "I couldn't determine which select menu you're adding."
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

        if (!Array.isArray(saved.components)) {
            saved.components = [];
        }

        const placeholder =
            interaction.fields
                .getTextInputValue("placeholder")
                .trim();

        const customId =
            interaction.fields
                .getTextInputValue("customId")
                .trim();

        const disabledInput =
            interaction.fields
                .getTextInputValue("disabled")
                .trim()
                .toLowerCase();

        if (!customId) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "A Custom ID is required."
                    )
                ],
                flags: 64
            });
        }

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
         * This is intentionally stored as a
         * String Select Menu instead of Discord's
         * native Role Select Menu.
         *
         * That lets us control the visible name
         * while storing the real Discord role ID.
         */

        if (type === "role") {

            let roleName = "";

            let roleId = "";

            try {

                roleName =
                    interaction.fields
                        .getTextInputValue(
                            "roleName"
                        )
                        .trim();

            } catch {
                roleName = "";
            }

            try {

                roleId =
                    interaction.fields
                        .getTextInputValue(
                            "roleId"
                        )
                        .trim();

            } catch {
                roleId = "";
            }

            if (!roleName) {
                return interaction.reply({
                    embeds: [
                        embeds.error(
                            interaction.user,
                            "A Role Name is required."
                        )
                    ],
                    flags: 64
                });
            }

            /*
             * Accept either:
             *
             * 123456789012345678
             *
             * or:
             *
             * <@&123456789012345678>
             */

            const mentionMatch =
                roleId.match(
                    /^<@&(\d+)>$/
                );

            if (mentionMatch) {
                roleId =
                    mentionMatch[1];
            }

            if (!/^\d+$/.test(roleId)) {
                return interaction.reply({
                    embeds: [
                        embeds.error(
                            interaction.user,
                            "Please provide a valid Discord role ID or role mention."
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
                            "I couldn't find that role in this server."
                        )
                    ],
                    flags: 64
                });
            }

            /*
             * Role Selects are String Select Menus.
             */

            let row =
                saved.components.find(
                    componentRow =>
                        componentRow &&
                        componentRow.type === 1 &&
                        Array.isArray(
                            componentRow.components
                        ) &&
                        componentRow.components.length === 0
                );

            /*
             * Do not put a select menu beside
             * another select menu.
             */

            if (!row) {

                if (saved.components.length >= 5) {
                    return interaction.reply({
                        embeds: [
                            embeds.error(
                                interaction.user,
                                `Embed **${name}** already has the maximum of **5 component rows**.`
                            )
                        ],
                        flags: 64
                    });
                }

                row = {
                    type: 1,
                    components: []
                };

                saved.components.push(row);

            }

            /*
             * Find an existing Role Select with
             * this custom ID so multiple roles can
             * be added to the same selector.
             */

            let selectMenu =
                row.components.find(
                    component =>
                        component &&
                        component.type === 3 &&
                        component.custom_id === customId &&
                        component.role_select === true
                );

            if (!selectMenu) {

                selectMenu = {
                    type: 3,

                    custom_id: customId,

                    placeholder:
                        placeholder ||
                        "Select your role...",

                    disabled:
                        disabledInput === "true",

                    min_values: 1,

                    max_values: 1,

                    role_select: true,

                    options: []
                };

                row.components.push(
                    selectMenu
                );

            } else {

                /*
                 * Keep the configured placeholder
                 * and disabled state updated.
                 */

                selectMenu.placeholder =
                    placeholder ||
                    "Select your role...";

                selectMenu.disabled =
                    disabledInput === "true";

            }

            /*
             * Prevent duplicate role options.
             */

            const alreadyExists =
                selectMenu.options.some(
                    option =>
                        option.value === role.id
                );

            if (alreadyExists) {
                return interaction.reply({
                    embeds: [
                        embeds.error(
                            interaction.user,
                            `The role **${role.name}** is already configured for this Role Select.`
                        )
                    ],
                    flags: 64
                });
            }

            if (
                selectMenu.options.length >= 25
            ) {
                return interaction.reply({
                    embeds: [
                        embeds.error(
                            interaction.user,
                            "A select menu can contain a maximum of 25 roles."
                        )
                    ],
                    flags: 64
                });
            }

            selectMenu.options.push({

                label:
                    roleName
                        .slice(0, 100),

                value:
                    role.id,

                description:
                    `Give ${role.name}`
                        .slice(0, 100)

            });

            /*
             * Discord String Select Menus cannot
             * exceed 25 options.
             */

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
                        `**${roleName}** has been added to the Role Select for **${name}**.`
                    )
                ],
                flags: 64
            });

        }

        /*
         * OTHER SELECT MENU TYPES
         */

        const typeMap = {
            user: 5,
            mentionable: 7,
            channel: 8
        };

        const componentType =
            typeMap[type];

        if (!componentType) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "That select menu type isn't supported."
                    )
                ],
                flags: 64
            });
        }

        let row =
            saved.components.find(
                componentRow =>
                    componentRow &&
                    componentRow.type === 1 &&
                    Array.isArray(
                        componentRow.components
                    ) &&
                    componentRow.components.length === 0
            );

        if (!row) {

            if (saved.components.length >= 5) {
                return interaction.reply({
                    embeds: [
                        embeds.error(
                            interaction.user,
                            `Embed **${name}** already has the maximum of **5 component rows**.`
                        )
                    ],
                    flags: 64
                });
            }

            row = {
                type: 1,
                components: []
            };

            saved.components.push(row);
        }

        const selectMenu = {

            type:
                componentType,

            custom_id:
                customId,

            disabled:
                disabledInput === "true"

        };

        if (placeholder) {
            selectMenu.placeholder =
                placeholder;
        }

        row.components.push(
            selectMenu
        );

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
                    `A new ${type} select menu has been added to **${name}**.`
                )
            ],
            flags: 64
        });

    }

};
