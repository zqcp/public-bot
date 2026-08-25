const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");
const editor = require("../../systems/messages/editor");

module.exports = {

    name: "embedAuthorModal",

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

        const authorName =
            interaction.fields
                .getTextInputValue("name")
                .trim();

        const authorUrl =
            interaction.fields
                .getTextInputValue("url")
                .trim();

        const iconURL =
            interaction.fields
                .getTextInputValue("iconURL")
                .trim();

        /*
         * Build the author object only from
         * information the user supplied.
         */

        const author = {};

        if (authorName) {
            author.name = authorName;
        }

        if (authorUrl) {
            author.url = authorUrl;
        }

        if (iconURL) {
            author.icon_url = iconURL;
        }

        /*
         * If everything was cleared, remove only
         * the author from the existing embed.
         */

        if (!Object.keys(author).length) {

            delete saved.embeds[0].author;

        } else {

            /*
             * Preserve any existing author information
             * that wasn't explicitly changed.
             */

            saved.embeds[0].author = {
                ...saved.embeds[0].author,
                ...author
            };

        }

        saved.markModified("embeds");

        await saved.save();

        /*
         * Update all existing Discord messages
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
                    `The author for **${name}** has been updated.`
                )
            ],
            flags: 64
        });

    }

};
