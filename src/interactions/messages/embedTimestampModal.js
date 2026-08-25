const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");
const editor = require("../../systems/messages/editor");

module.exports = {

    name: "embedTimestampModal",

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

        if (
            !Array.isArray(saved.embeds) ||
            !saved.embeds.length
        ) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        `Embed **${name}** doesn't have an embed to edit yet.`
                    )
                ],
                flags: 64
            });
        }

        const input =
            interaction.fields
                .getTextInputValue("timestamp")
                .trim();

        /*
         * Empty input removes the timestamp.
         */

        if (!input) {

            delete saved.embeds[0].timestamp;

        } else {

            const timestamp =
                new Date(input);

            if (
                Number.isNaN(
                    timestamp.getTime()
                )
            ) {
                return interaction.reply({
                    embeds: [
                        embeds.error(
                            interaction.user,
                            "Invalid timestamp. Use a valid date such as `2026-08-25T16:00:00.000Z`."
                        )
                    ],
                    flags: 64
                });
            }

            saved.embeds[0].timestamp =
                timestamp.toISOString();

        }

        saved.markModified("embeds");

        await saved.save();

        /*
         * Update every existing Discord message
         * connected to this saved embed.
         */

        await editor.updateMessage(
            client,
            interaction.guild.id,
            name
        );

        return interaction.reply({
            embeds: [
                embeds.success(
                    interaction.user,
                    `The timestamp for **${name}** has been updated.`
                )
            ],
            flags: 64
        });

    }

};
