const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");
const editor = require("../../systems/messages/editor");

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
         *
         * Everything else already stored in the
         * embed remains untouched.
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
