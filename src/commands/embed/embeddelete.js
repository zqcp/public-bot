const MessageStorage = require("../../systems/messages/storage");
const GlobalEmbed = require("../../embeds/global");
const HelpEmbed = require("../../embeds/help/embed");

module.exports = {

    name: "embed delete",

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
                    HelpEmbed.delete(
                        message.author
                    )
                ]
            });
        }


        // ==========================================
        // NAME
        // ==========================================

        const name = args[0]
            .toLowerCase()
            .trim();


        // ==========================================
        // CHECK NAME
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
        // CHECK EXISTS
        // ==========================================

        const exists =
            await MessageStorage.exists(
                message.guild.id,
                name
            );

        if (!exists) {
            return message.channel.send({
                embeds: [
                    GlobalEmbed.error(
                        `I couldn't find a saved embed named \`${name}\`.`
                    )
                ]
            });
        }


        // ==========================================
        // DELETE
        // ==========================================

        const deleted =
            await MessageStorage.delete(
                message.guild.id,
                name
            );

        if (!deleted) {
            return message.channel.send({
                embeds: [
                    GlobalEmbed.failed(
                        message.author,
                        "delete",
                        name
                    )
                ]
            });
        }


        // ==========================================
        // SUCCESS
        // ==========================================

        return message.channel.send({
            embeds: [
                GlobalEmbed.success(
                    message.author,
                    "deleted",
                    name
                )
            ]
        });
    }
};
