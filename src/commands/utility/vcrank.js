// src/commands/utility/vcrank.js

const VCConfig =
    require("../../models/VCConfig");

const globalEmbeds =
    require("../../embeds/global");

const config =
    require("../../config");


module.exports = {

    name: "set vc rank",

    aliases: [],

    async execute(
        client,
        message,
        args
    ) {

        if (
            !message.member.permissions.has(
                "ManageGuild"
            )
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


        const channel =
            message.mentions.channels.first() ||
            message.guild.channels.cache.get(
                args[0]
            );


        if (
            !channel ||
            !channel.isTextBased()
        ) {

            return message.channel.send({
                embeds: [
                    globalEmbeds.error(
                        `${config.emojis.error} ${message.author}: Please provide a valid **text channel**.`
                    )
                ]
            });

        }


        await VCConfig.findOneAndUpdate(
            {
                guildId:
                    message.guild.id
            },
            {
                $set: {
                    rankChannelId:
                        channel.id
                }
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            }
        );


        return message.channel.send({
            embeds: [
                globalEmbeds.regular(
                    `${config.emojis.success} ${message.author}: Voice level-up messages will now be sent to ${channel}.`
                )
            ]
        });

    }

};
