module.exports = {
    type: "button",
    name: "embed_",

    async execute(interaction) {

        await interaction.reply({
            content: "Embed interaction received.",
            flags: 64
        });

    }
};
