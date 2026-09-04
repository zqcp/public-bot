const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = {

    name: "roleSetupModal",

    type: "modal",

    async execute(
        client,
        interaction
    ) {

        if (!interaction.guild) {
            return;
        }

        return interaction.reply({

            content:
                "Role setup modal is working.",

            components: [

                new ActionRowBuilder()
                    .addComponents(

                        new ButtonBuilder()
                            .setCustomId("roleSetupTest")
                            .setLabel("Test")
                            .setStyle(
                                ButtonStyle.Secondary
                            )

                    )

            ],

            flags: 64

        });

    }

};
