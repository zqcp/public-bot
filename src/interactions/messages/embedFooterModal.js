const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");
const editor = require("../../systems/messages/editor");

module.exports = {

    name: "embedFooterModal",

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

        const text =
            interaction.fields
                .getTextInputValue("text")
                .trim();

        const iconURL =
            interaction.fields
                .getTextInputValue("iconURL")
                .trim();

        /*
         * If both fields are empty, explicitly
         * remove the existing footer.
         */

        if (!text && !iconURL) {

            delete saved.embeds[0].footer;

        } else {

            const footer = {
                ...saved.embeds[0].footer
            };

            if (text) {
                footer.text = text;
            } else {
                delete footer.text;
            }

            if (iconURL) {
                footer.icon_url = iconURL;
            } else {
                delete footer.icon_url;
            }

            saved.embeds[0].footer = footer;

        }

        saved.markModified("embeds");

        await saved.save();

        /*
         * Update every Discord message connected
         * to this saved embed.
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
                    `The footer for **${name}** has been updated.`
                )
            ],
            flags: 64
        });

    }

};
