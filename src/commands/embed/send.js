const Embed = require("../../models/Embed");
const embeds = require("../../embeds/embeds");
const helpEmbed = require("../../embeds/help/embed");
const globalEmbeds = require("../../embeds/global");
const renderer = require("../../systems/messages/renderer");

module.exports = {

    name: "embed send",

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

        const name = args[0]
            ?.trim()
            .toLowerCase();

        if (!name) {
            return message.channel.send({
                embeds: [
                    helpEmbed.send(
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
         * Resolve the target channel.
         *
         * Supports:
         * #channel
         * channel ID
         * current channel
         */

        const channelInput = args[1];

        let targetChannel;

        if (!channelInput) {

            targetChannel = message.channel;

        } else {

            const channelId =
                channelInput
                    .replace(/[<#>]/g, "");

            targetChannel =
                message.guild.channels.cache.get(
                    channelId
                );

        }

        if (!targetChannel) {
            return message.channel.send({
                embeds: [
                    embeds.error(
                        message.author,
                        "I couldn't find that channel."
                    )
                ]
            });
        }

        /*
         * Render saved configuration
         */

        let payload;

        try {

            payload =
                renderer.render(
                    saved.toObject()
                );

        } catch (error) {

            console.error(
                `[EMBED SEND] ${error.message}`
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
         * Send the actual saved message.
         */

        let sentMessage;

        try {

            sentMessage =
                await targetChannel.send(
                    payload
                );

        } catch (error) {

            console.error(
                `[EMBED SEND] ${error.message}`
            );

            return message.channel.send({
                embeds: [
                    embeds.error(
                        message.author,
                        "I couldn't send the embed to that channel."
                    )
                ]
            });

        }

        /*
         * Register the exact message Discord
         * just returned.
         *
         * Remove previous references for this
         * embed in this channel so Save always
         * targets the newest sent message.
         */

        if (!Array.isArray(saved.messages)) {
            saved.messages = [];
        }

        saved.messages =
            saved.messages.filter(
                reference =>
                    reference.channelId !==
                    targetChannel.id
            );

        saved.messages.push({
            channelId:
                targetChannel.id,

            messageId:
                sentMessage.id
        });

        saved.markModified(
            "messages"
        );

        try {

            await saved.save();

        } catch (error) {

            console.error(
                `[EMBED SEND] Failed to register ${name}:`,
                error
            );

            return message.channel.send({
                embeds: [
                    embeds.error(
                        message.author,
                        "The embed was sent, but I couldn't register the message for future updates."
                    )
                ]
            });

        }

        return message.channel.send({
            embeds: [
                embeds.success(
                    message.author,
                    `Embed **${name}** has been sent to ${targetChannel}.`
                )
            ]
        });

    }

};
