const {
    EmbedBuilder
} = require("discord.js");

module.exports = {
    type: "button",
    name: "embed_",

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setTitle("Embed Builder")
            .setDescription(
                "Use the buttons below to customize your embed."
            );

        await interaction.reply({
            embeds: [embed],
            flags: 64
        });

    }
};
