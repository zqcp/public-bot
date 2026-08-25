const embeds = require("../../embeds/embeds");

module.exports = {

    name: "embedSelectMenuRemoveConfirmNo",

    type: "button",

    async execute(client, interaction) {

        if (!interaction.guild) {
            return;
        }

        const parts =
            interaction.customId.split(":");

        const name =
            parts[1];

        if (!name) {
            return interaction.update({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "I couldn't determine which embed you're editing."
                    )
                ],
                components: []
            });
        }

        return interaction.update({
            embeds: [
                embeds.regular(
                    interaction.user,
                    `Removal cancelled for **${name}**.`
                )
            ],
            components: []
        });

    }

};
