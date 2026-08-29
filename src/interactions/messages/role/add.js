const Embed = require("../../../models/Embed");
const embeds = require("../../../embeds/embeds");

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

        const roleId =
            interaction.customId.split(":")[1];

        if (!roleId) {
            return interaction.reply({
                content:
                    "No role ID was provided.",
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

        if (role.managed) {
            return interaction.reply({
                content:
                    "That role cannot be used.",
                flags: 64
            });
        }

        return interaction.reply({
            content:
                `Role ready to add: **${role.name}**\nRole ID: \`${role.id}\``,
            flags: 64
        });

    }

};
