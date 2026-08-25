const MessageStorage = require("../../systems/messages/storage");
const MessageRenderer = require("../../systems/messages/renderer");

const GlobalEmbed = require("../../embeds/global");
const HelpEmbed = require("../../embeds/help/embed");

module.exports = {

    name: "embed send",

    async execute(cilent, message, args) {

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
                    HelpEmbed.send(
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
        // CHANNEL
        // ==========================================

        const channel =
            message.mentions.channels.first() ||
            message.channel;


        // ==========================================
        // CONTEXT
        // ==========================================

        const context = {
            user: message.author,
            server: message.guild,
            guild: message.guild,
            channel
        };


        // ==========================================
        // BUILD MESSAGE
        // ==========================================

        const payload =
            MessageRenderer.build(
                saved,
                context
            );


        // ==========================================
        // CHECK EMPTY
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


        // ==========================================
        // SEND
        // ==========================================

        try {

            const sent =
                await channel.send(
                    payload
                );


            // ======================================
            // SAVE DISCORD MESSAGE
            // ======================================

            await MessageStorage.saveMessage(
                message.guild.id,
                name,
                sent,
                saved
            );


            // ======================================
            // SUCCESS
            // ======================================

            return message.channel.send({
                embeds: [
                    GlobalEmbed.success(
                        message.author,
                        "sent",
                        name
                    )
                ]
            });

        } catch (error) {

            console.error(
                "[EMBED SEND]",
                error
            );

            return message.channel.send({
                embeds: [
                    GlobalEmbed.failed(
                        message.author,
                        "send",
                        name
                    )
                ]
            });
        }
    }
};
