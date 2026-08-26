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

        const name = parts[1];
        const type = parts[2];

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

        const placeholder =
            interaction.fields
                .getTextInputValue("placeholder")
                .trim();

        const disabled =
            interaction.fields
                .getTextInputValue("disabled")
                .trim()
                .toLowerCase() === "true";

        if (!Array.isArray(saved.components)) {
            saved.components = [];
        }

        /*
         * ROLE SELECT
         *
         * Uses a String Select Menu.
         *
         * custom_id = role-select
         * placeholder = Select your role...
         * role name = option label
         * role ID = option value
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

            const row = {
                type: 1,

                components: [
                    {
                        type: 3,

                        custom_id: "role-select",

                        placeholder:
                            placeholder ||
                            "Select your role...",

                        disabled,

                        min_values: 1,
                        max_values: 1,

                        options: [
                            {
                                label: roleName,
                                value: role.id
                            }
                        ]
                    }
                ]
            };

            saved.components.push(
                row
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
                        `Role **${roleName}** was added to **${name}**.`
                    )
                ],
                flags: 64
            });
        }

        /*
         * OTHER SELECT MENUS
         */

        const customId =
            interaction.fields
                .getTextInputValue("customId")
                .trim();

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

        const row = {
            type: 1,

            components: [
                {
                    type: componentType,

                    custom_id: customId,

                    placeholder:
                        placeholder ||
                        "Select something...",

                    disabled
                }
            ]
        };

        saved.components.push(
            row
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
