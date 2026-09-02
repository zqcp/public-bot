const Embed = require("../../../models/Embed");

module.exports = {

    name: "roleAdd",

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

        if (!name || !roleId) {

            return interaction.reply({
                content:
                    "Invalid role configuration.",
                flags: 64
            });

        }

        const role =
            interaction.guild.roles.cache.get(
                roleId
            );

        if (!role) {

            return interaction.reply({
                content:
                    "That role no longer exists.",
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

            if (!Array.isArray(saved.components)) {
                saved.components = [];
            }

            let row =
                saved.components.find(
                    component =>
                        Array.isArray(
                            component.components
                        ) &&
                        component.components.some(
                            item =>
                                item.type === 3 &&
                                item.custom_id ===
                                    `roleSelect:${name}`
                        )
                );

            if (!row) {

                row = {
                    type: 1,
                    components: [
                        {
                            type: 3,
                            custom_id:
                                `roleSelect:${name}`,
                            placeholder:
                                "Select your roles...",
                            min_values: 1,
                            max_values: 1,
                            options: []
                        }
                    ]
                };

                saved.components.push(
                    row
                );

            }

            const menu =
                row.components.find(
                    item =>
                        item.type === 3
                );

            if (
                !menu.options
            ) {
                menu.options = [];
            }

            const exists =
                menu.options.some(
                    option =>
                        option.value ===
                        role.id
                );

            if (!exists) {

                menu.options.push({
                    label:
                        role.name.slice(
                            0,
                            100
                        ),
                    value:
                        role.id,
                    description:
                        `Role ID: ${role.id}`
                });

            }

            menu.max_values =
                menu.options.length;

            saved.markModified(
                "components"
            );

            await saved.save();

            return interaction.reply({
                content:
                    `Added **${role.name}** to the role selector for **${name}**.`,
                flags: 64
            });

        } catch (error) {

            console.error(
                "[ROLE ADD]",
                error
            );

            return interaction.reply({
                content:
                    "I couldn't add that role to the selector.",
                flags: 64
            });

        }

    }

};
