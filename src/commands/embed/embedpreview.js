const MessageStorage = require("../../systems/messages/storage");
const MessageRenderer = require("../../systems/messages/renderer");

const GlobalEmbed = require("../../embeds/global");
const HelpEmbed = require("../../embeds/help/embed");

module.exports = {

    name: "embed preview",

    async execute(message, args) {

        // ==========================================
        // PERMISSION
        // ==========================================

        if (
            !message.member.permissions.has(
                "ManageGuild"
            )
        ) {
            return message.channel.send({
                embeds: [
                    GlobalEmbed.permission(
                        message.author,
                        "Manage Server"
                    )
                ]
            });
        }


        // ==========================================
        // HELP
        // ==========================================

        if (!args.length) {
            return message.channel.send({
                embeds: [
                    HelpEmbed.preview(
                        message.author
                    )
                ]
            });
        }


        // ==========================================
        // MESSAGE NAME
        // ==========================================

        const name = args[0]
            .toLowerCase()
            .trim();


        // ==========================================
        // VALIDATE NAME
        // ==========================================

        if (!/^[a-z0-9_-]+$/i.test(name)) {
            return message.channel.send({
                embeds: [
                    GlobalEmbed.error(
                        "The message name can only contain letters, numbers, `_`, and `-`."
                    )
                ]
            });
        }


        // ==========================================
        // GET SAVED MESSAGE
        // ==========================================

        const saved =
            await MessageStorage.get(
                message.guild.id,
                name
            );

        if (!saved) {
            return message.channel.send({
                embeds: [
                    GlobalEmbed.error(
                        `I couldn't find a saved embed named \`${name}\`.`
                    )
                ]
            });
        }


        // ==========================================
        // CONTEXT
        // ==========================================

        const context = {
            user: message.author,
            server: message.guild,
            guild: message.guild,
            channel: message.channel
        };


        // ==========================================
        // BUILD PREVIEW
        // ==========================================

        const payload =
            MessageRenderer.build(
                saved,
                context
            );


        // ==========================================
        // SEND PREVIEW
        // ==========================================

        if (
            !payload.content &&
            !payload.embeds?.length &&
            !payload.components?.length
        ) {
            return message.channel.send({
                embeds: [
                    GlobalEmbed.error(
                        `The saved embed \`${name}\` is empty.`
                    )
                ]
            });
        }


        return message.channel.send(
            payload
        );
    }
};
