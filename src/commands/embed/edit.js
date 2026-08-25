const Embed = require("../../models/Embed");
const embeds = require("../../embeds/embeds");
const helpEmbed = require("../../embeds/help/embed");
const globalEmbeds = require("../../embeds/global");

module.exports = {

    name: "embed edit",

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
                    helpEmbed.edit(
                        message.author
                    )
                ]
            });
        }

        /*
         * Find saved embed
         */

        const existing =
            await Embed.findOne({
                guildId: message.guild.id,
                name
            });

        if (!existing) {
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
         * Open the existing embed editor.
         *
         * The editor will load the complete saved
         * configuration so existing information is
         * preserved.
         */

        return message.channel.send({
            embeds: [
                embeds.regular(
                    message.author,
                    `Editing embed **${name}**.`
                )
            ]
        });

    }

};
