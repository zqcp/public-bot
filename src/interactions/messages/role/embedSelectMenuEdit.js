module.exports = {

    name: "embedSelectMenuEdit",

    type: "button",

    async execute(client, interaction) {

        if (!interaction.guild) {
            return;
        }

        const parts =
            interaction.customId.split(":");

        const type =
            parts[1];

        const action =
            parts[2];

        if (
            type !== "roles" ||
            action !== "role"
        ) {
            return interaction.reply({
                content: "Invalid role editor.",
                flags: 64
            });
        }

        return interaction.reply({
            content: "Select your roles...",
            flags: 64
        });

    }

};
