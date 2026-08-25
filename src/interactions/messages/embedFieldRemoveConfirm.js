const embeds = require("../../embeds/embeds");
const Embed = require("../../models/Embed");
const editor = require("../../systems/messages/editor");

module.exports = {

    name: "embedFieldRemoveConfirm",

    type: "button",

    async execute(client, interaction) {

        if (!interaction.guild) {
            return;
        }

        const [, name, index] =
            interaction.customId.split(":");

        const fieldIndex =
            Number(index);

        if (
            !name ||
            Number.isNaN(fieldIndex)
        ) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "I couldn't determine which field you're removing."
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

        const fields =
            Array.isArray(saved.embeds?.[0]?.fields)
                ? saved.embeds[0].fields
                : [];

        if (!fields[fieldIndex]) {
            return interaction.reply({
                embeds: [
                    embeds.error(
                        interaction.user,
                        "That field no longer exists."
                    )
                ],
                flags: 64
            });
        }

        const removed =
            fields[fieldIndex];

        fields.splice(
            fieldIndex,
            1
        );

        saved.embeds[0].fields =
            fields;

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

        return interaction.update({
            embeds: [
                embeds.success(
                    interaction.user,
                    `Field **${removed.name}** has been removed from **${name}**.`
                )
            ],
            components: []
        });

    }

};
