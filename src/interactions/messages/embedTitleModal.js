const Embed = require("../../models/Embed");
const embeds = require("../../embeds/embeds");
const renderer = require("../../systems/messages/renderer");

module.exports = {

    name: "embedTitleModal",

    type: "modal",

    async execute(client, interaction) {

        if (!interaction.guild) {
            return;
        }

        const parts =
            interaction.customId.split(":");

        const name =
            parts[1];

        const editorMessageId =
            parts[2];

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

        const title =
            interaction.fields
                .getTextInputValue("title")
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
         * Save the title.
         */

        if (title) {

            saved.embeds[0].title =
                title;

        } else {

            delete saved.embeds[0].title;

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
         * LIVE PREVIEW
         *
         * Update the existing embed edit message
         * immediately after changing the data.
         *
         * This does NOT update the sent embed messages.
         * Those are still updated when Save is pressed.
         */

        if (editorMessageId) {

            try {

                const editorMessage =
                    await interaction.message.channel.messages.fetch(
                        editorMessageId
                    );

                const payload =
                    renderer.render(
                        saved.toObject()
                    );

                await editorMessage.edit({
                    embeds:
                        Array.isArray(payload.embeds)
                            ? payload.embeds
                            : []
                });

            } catch (error) {

                console.error(
                    `[EMBED TITLE PREVIEW] Failed to update ${name}:`,
                    error
                );

            }

        }

        /*
         * Confirm the data actually persisted.
         */

        const verify =
            await Embed.findOne({
                guildId: interaction.guild.id,
                name
            }).lean();

        console.log(
            `[EMBED TITLE] Saved ${name}:`,
            verify?.embeds?.[0]?.title || "(no title)"
        );

        /*
         * The editor preview has already been updated above.
         */

        return interaction.reply({
            embeds: [
                embeds.success(
                    interaction.user,
                    title
                        ? `The title for **${name}** has been updated.`
                        : `The title for **${name}** has been removed.`
                )
            ],
            flags: 64
        });

    }

};
