const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");
const editor = require("../../systems/messages/editor");
const renderer = require("../../systems/messages/renderer");

module.exports = {

    name: "embedContentModal",

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

        const content =
            interaction.fields.getTextInputValue(
                "content"
            );

        /*
         * Only update content.
         */

        await editor.updateAndRender(
            client,
            interaction.guild.id,
            name,
            {
                content:
                    content.trim() || null
            }
        );

        /*
         * Get the updated embed and show it
         * immediately in the editor.
         */

        const updated =
            await Embed.findOne({
                guildId: interaction.guild.id,
                name
            });

        if (updated) {

            const preview =
                renderer.render(
                    updated.toObject()
                );

            return interaction.reply({
                ...preview,
                flags: 64
            });

        }

        return interaction.reply({
            embeds: [
                embeds.success(
                    interaction.user,
                    `Embed **${name}** content has been updated.`
                )
            ],
            flags: 64
        });

    }

};
