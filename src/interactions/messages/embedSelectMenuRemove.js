const {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");

module.exports = {

    name: "embedSelectMenuRemove",

    type: "button",

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
                        "I couldn't determine which select menu you're removing."
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

        const menus = [];

        if (Array.isArray(saved.components)) {

            for (
                let rowIndex = 0;
                rowIndex < saved.components.length;
                rowIndex++
            ) {

                const row =
                    saved.components[rowIndex];

                if (!Array.isArray(row?.components)) {
                    continue;
                }

                for (
                    let componentIndex = 0;
                    componentIndex < row.components.length;
                    componentIndex++
                ) {

                    const component =
                        row.components[componentIndex];

                    if (!component) {
                        continue;
                    }

                    let componentType = null;

                    /*
                     * Your Role Select is stored as a
                     * String Select (type 3) with role IDs
                     * stored inside the option values.
                     */
                    if (component.type === 3) {

                        const isRoleMenu =
                            Array.isArray(component.options) &&
                            component.options.length > 0 &&
                            component.options.every(
                                option =>
                                    interaction.guild.roles.cache.has(
                                        String(option.value)
                                    )
                            );

                        componentType =
                            isRoleMenu
                                ? "role"
                                : "string";

                    } else if (component.type === 5) {

                        componentType = "user";

                    } else if (component.type === 6) {

                        componentType = "role";

                    } else if (component.type === 7) {

                        componentType = "mentionable";

                    } else if (component.type === 8) {

                        componentType = "channel";
                    }

                    if (componentType !== type) {
                        continue;
                    }

                    menus.push({
                        rowIndex,
                        componentIndex,
                        component
                    });

                }

            }

        }

        if (!menus.length) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        `Embed **${name}** doesn't have any ${type} select menus to remove.`
                    )
                ],
                flags: 64
            });
        }

        const options =
            menus.map(
                (
                    {
                        rowIndex,
                        componentIndex,
                        component
                    },
                    index
                ) => {

                    const label =
                        type === "role" &&
                        component.type === 3 &&
                        Array.isArray(component.options) &&
                        component.options.length
                            ? component.options[0].label
                            : component.placeholder ||
                              component.custom_id ||
                              `Select Menu ${index + 1}`;

                    return new StringSelectMenuOptionBuilder()
                        .setLabel(
                            label.length > 100
                                ? label.slice(0, 97) + "..."
                                : label
                        )
                        .setDescription(
                            component.custom_id
                                ? `Custom ID: ${component.custom_id}`
                                : `Row ${rowIndex + 1}, Menu ${componentIndex + 1}`
                        )
                        .setValue(
                            `${rowIndex}:${componentIndex}`
                        );

                }
            );

        const menu =
            new StringSelectMenuBuilder()
                .setCustomId(
                    `embedSelectMenuRemoveSelect:${name}:${type}`
                )
                .setPlaceholder(
                    `Select a ${type} menu to remove...`
                )
                .addOptions(options);

        const row =
            new ActionRowBuilder()
                .addComponents(menu);

        const back =
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(
                            `embedButtonSelect:${name}`
                        )
                        .setLabel("Back")
                        .setStyle(
                            ButtonStyle.Secondary
                        )
                );

        return interaction.reply({
            embeds: [
                embeds.regular(
                    interaction.user,
                    `Select the **${type} select menu** from **${name}** that you want to remove.`
                )
            ],
            components: [
                row,
                back
            ],
            flags: 64
        });

    }

};
