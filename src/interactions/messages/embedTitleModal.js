const Embed = require("../../models/Embed");
const embeds = require("../../embeds/embeds");

module.exports = {

    name: "embedTitleModal",

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

        if (!Array.isArray(saved.embeds)) {
            saved.embeds = [];
        }

        if (!saved.embeds.length) {
            saved.embeds.push({});
        }

        if (title) {
            saved.embeds[0].title = title;
        } else {
            delete saved.embeds[0].title;
        }

        await saved.save();

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
