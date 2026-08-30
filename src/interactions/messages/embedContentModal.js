const Embed = require("../../models/Embed");
const embeds = require("../../embeds/embeds");

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

        const content =
            interaction.fields
                .getTextInputValue(
                    "content"
                )
                .trim();

        const saved =
            await Embed.findOne({
                guildId:
                    interaction.guild.id,

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

        try {

            saved.content =
                content || null;

            saved.markModified(
                "content"
            );

            await saved.save();

            return interaction.reply({
                embeds: [
                    embeds.success(
                        interaction.user,
                        `Content for **${name}** has been updated.`
                    )
                ],
                flags: 64
            });

        } catch (error) {

            console.error(
                `[EMBED CONTENT] Failed to update ${name}:`,
                error
            );

            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        `I couldn't update the content for **${name}**.`
                    )
                ],
                flags: 64
            });

        }

    }

};
