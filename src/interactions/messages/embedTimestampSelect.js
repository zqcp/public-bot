const Embed = require("../../models/Embed");
const embeds = require("../../embeds/embeds");
const renderer = require("../../systems/messages/renderer");

module.exports = {

    name: "embedTimestampSelect",

    type: "selectMenu",

    async execute(client, interaction) {

        if (!interaction.guild) {
            return;
        }

        await interaction.deferUpdate();

        const parts =
            interaction.customId.split(":");

        const name =
            parts[1];

        if (!name) {
            return interaction.followUp({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "I couldn't determine which embed you're editing."
                    )
                ],
                flags: 64
            });
        }

        const value =
            interaction.values[0];

        const saved =
            await Embed.findOne({
                guildId: interaction.guild.id,
                name
            });

        if (!saved) {
            return interaction.followUp({
                embeds: [
                    embeds.error(
                        interaction.user,
                        `I couldn't find an embed named **${name}**.`
                    )
                ],
                flags: 64
            });
        }

        /*
         * Make sure the embeds array exists.
         */

        if (!Array.isArray(saved.embeds)) {
            saved.embeds = [];
        }

        /*
         * Make sure the first embed exists.
         */

        if (!saved.embeds.length) {
            saved.embeds.push({});
        }

        /*
         * Apply timestamp setting.
         */

        if (value === "yes") {

            saved.embeds[0].timestamp =
                new Date();

        } else {

            delete saved.embeds[0].timestamp;

        }

        /*
         * IMPORTANT:
         *
         * embeds is a nested array/object.
         * Explicitly tell Mongoose that it changed.
         */

        saved.markModified("embeds");

        await saved.save();

        /*
         * Update the live editor preview.
         */

        try {

            const payload =
                renderer.render(
                    saved.toObject(),
                    interaction.member
                );

            await interaction.message.edit({
                embeds:
                    Array.isArray(payload.embeds)
                        ? payload.embeds
                        : []
            });

        } catch (error) {

            console.error(
                `[EMBED TIMESTAMP PREVIEW] Failed to update ${name}:`,
                error
            );

        }

        return interaction.editReply({
            components: []
        });

    }

};
