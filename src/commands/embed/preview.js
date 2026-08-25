const Embed = require("../../models/Embed");
const embeds = require("../../embeds/embeds");
const helpEmbed = require("../../embeds/help/embed");
const globalEmbeds = require("../../embeds/global");
const renderer = require("../../systems/messages/renderer");

module.exports = {

    name: "embed preview",

    aliases: [],

    permissions: {
        user: ["ManageGuild"],
        bot: ["ManageGuild"]
    },

    async execute(client, message, args) {

        if (!message.guild) {
            return;
        }

        /*
         * User permission
         */

        if (
            !message.member.permissions.has("ManageGuild")
        ) {
            return message.channel.send({
                embeds: [
                    globalEmbeds.permission(
                        message.author,
                        "Manage Server"
                    )
                ]
            });
        }

        /*
         * Bot permission
         */

        if (
            !message.guild.members.me.permissions.has(
                "ManageGuild"
            )
        ) {
            return message.channel.send({
                embeds: [
                    globalEmbeds.botPermission(
                        message.author,
                        ["ManageGuild"]
                    )
                ]
            });
        }

        /*
         * Help
         */

        const name = args
            .join(" ")
            .trim()
            .toLowerCase();

        if (!name) {
            return message.channel.send({
                embeds: [
                    helpEmbed.preview(
                        message.author
                    )
                ]
            });
        }

        /*
         * Find saved embed
         */

        const saved =
            await Embed.findOne({
                guildId: message.guild.id,
                name
            });

        if (!saved) {
            return message.channel.send({
                embeds: [
                    embeds.error(
                        message.author,
                        `I couldn't find an embed named **${name}**.`
                    )
                ]
            });
        }

        /*
         * Render the saved configuration.
         */

        let payload;

        try {

            payload = renderer.render(
                saved.toObject()
            );

        } catch (error) {

            console.error(
                `[EMBED PREVIEW] ${error.message}`
            );

            return message.channel.send({
                embeds: [
                    embeds.error(
                        message.author,
                        "I couldn't render that embed."
                    )
                ]
            });

        }

        /*
         * Preview only.
         *
         * Nothing is saved or modified.
         */

        return message.channel.send({
            content:
                payload.content || undefined,

            embeds:
                payload.embeds || [],

            components:
                payload.components || []
        });

    }

};
