const Embed = require("../../models/Embed");
const embeds = require("../../embeds/embeds");

module.exports = {

    name: "embedColorModal",

    type: "modal",

    async execute(client, interaction) {

        if (!interaction.guild) {
            return;
        }

        const [, name] =
            interaction.customId.split(":");

        if (!name) {

            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "I couldn't determine which embed you're editing."
                    )
                ],
                flags: 64
            });

        }

        const input =
            interaction.fields
                .getTextInputValue("color")
                .trim();

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

        if (!Array.isArray(saved.embeds)) {
            saved.embeds = [];
        }

        if (!saved.embeds.length) {
            saved.embeds.push({});
        }

        /*
         * Empty = remove custom color.
         */

        if (!input) {

            delete saved.embeds[0].color;

            saved.markModified("embeds");

            await saved.save();

            return interaction.reply({
                embeds: [
                    embeds.success(
                        interaction.user,
                        `Color for **${name}** has been removed.`
                    )
                ],
                flags: 64
            });

        }

        /*
         * Normalize #.
         */

        const hex =
            input.startsWith("#")
                ? input.slice(1)
                : input;

        /*
         * Validate HEX.
         */

        if (!/^[0-9a-fA-F]{6}$/.test(hex)) {

            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "Please provide a valid 6-digit HEX color, such as `#5865F2`."
                    )
                ],
                flags: 64
            });

        }

        /*
         * Save as Discord's integer
         * color format.
         */

        saved.embeds[0].color =
            parseInt(
                hex,
                16
            );

        saved.markModified("embeds");

        try {

            await saved.save();

            return interaction.reply({
                embeds: [
                    embeds.success(
                        interaction.user,
                        `Color for **${name}** has been updated to **#${hex.toUpperCase()}**.`
                    )
                ],
                flags: 64
            });

        } catch (error) {

            console.error(
                `[EMBED COLOR] Failed to update ${name}:`,
                error
            );

            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        `I couldn't update the color for **${name}**.`
                    )
                ],
                flags: 64
            });

        }

    }

};
