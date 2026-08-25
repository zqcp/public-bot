const {
    EmbedBuilder
} = require("discord.js");

const config = require("../../config");

module.exports = {

    type: "button",

    name: "embed_",

    async execute(interaction) {

        const parts =
            interaction.customId.split(":");

        const creatorId =
            parts[1];


        // =========================
        // OWNER CHECK
        // =========================

        if (
            creatorId &&
            interaction.user.id !== creatorId
        ) {

            const embed = new EmbedBuilder()
                .setColor(config.colors.failed)
                .setDescription(
                    `${config.emojis.failed} ${interaction.client.user}: You can't use this embed because you didn't create it.`
                );

            await interaction.reply({
                embeds: [embed],
                flags: 64
            });

            return;
        }


        // =========================
        // EMBED BUILDER
        // =========================

        const embed = new EmbedBuilder()
            .setColor(config.colors.regular)
            .setDescription(
                `${config.emojis.success} ${interaction.client.user}: **Embed Builder**\n\n` +
                `Customize your embed using the options below.`
            );


        await interaction.update({
            embeds: [embed]
        });

    }

};
