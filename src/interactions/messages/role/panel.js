const {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} = require("discord.js");

const Embed =
    require("../../../models/Embed");

module.exports = {

    name: "rolePanel",

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

        if (!name) {

            return interaction.reply({
                content:
                    "I couldn't determine which embed you're editing.",
                flags: 64
            });

        }

        const saved =
            await Embed.findOne({
                guildId:
                    interaction.guild.id,

                name
            }).lean();

        if (!saved) {

            return interaction.reply({
                content:
                    `I couldn't find the embed **${name}**.`,
                flags: 64
            });

        }

        const roles =
            interaction.guild.roles.cache
                .filter(role =>
                    role.id !==
                        interaction.guild.id &&
                    !role.managed
                )
                .sort(
                    (a, b) =>
                        b.position - a.position
                );

        if (!roles.size) {

            return interaction.reply({
                content:
                    "There are no roles available.",
                flags: 64
            });

        }

        const options =
            roles
                .map(
                    role =>
                        new StringSelectMenuOptionBuilder()
                            .setLabel(
                                role.name.slice(
                                    0,
                                    100
                                )
                            )
                            .setDescription(
                                `Role ID: ${role.id}`
                            )
                            .setValue(
                                role.id
                            )
                )
                .slice(0, 25);

        const menu =
            new StringSelectMenuBuilder()
                .setCustomId(
                    `roleSelect:${name}`
                )
                .setPlaceholder(
                    "Select your roles..."
                )
                .setMinValues(1)
                .setMaxValues(
                    options.length
                )
                .addOptions(
                    options
                );

        return interaction.reply({

            content:
                `Configure roles for **${name}**.`,

            components: [

                new ActionRowBuilder()
                    .addComponents(
                        menu
                    )

            ],

            flags: 64

        });

    }

};
