// src/commands/utility/vctier.js

const {
    EmbedBuilder
} = require("discord.js");

const VCTier =
    require("../../models/VCTier");

const globalEmbeds =
    require("../../embeds/global");

const config =
    require("../../config");


module.exports = {

    name: "set vc",

    aliases: [],

    async execute(
        client,
        message,
        args
    ) {

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


        const option =
            args[0]?.toLowerCase();


        if (
            option !== "level"
        ) {

            return message.channel.send({
                embeds: [
                    globalEmbeds.error(
                        `${message.author}: Use \`${config.prefix}set vc level @role <level>\`.`
                    )
                ]
            });

        }


        const role =
            message.mentions.roles.first() ||
            message.guild.roles.cache.get(
                args[1]
            );


        if (!role) {

            return message.channel.send({
                embeds: [
                    globalEmbeds.error(
                        `${message.author}: Please provide a valid **role**.`
                    )
                ]
            });

        }


        const level =
            Number(
                args[2]
            );


        if (
            !Number.isInteger(level) ||
            level < 1
        ) {

            return message.channel.send({
                embeds: [
                    globalEmbeds.error(
                        `${message.author}: Please provide a valid **level**.`
                    )
                ]
            });

        }


        try {

            await VCTier.findOneAndUpdate(
                {
                    guildId:
                        message.guild.id,

                    level
                },

                {
                    $set: {
                        roleId:
                            role.id
                    }
                },

                {
                    upsert: true,

                    new: true
                }
            );


            return message.channel.send({
                embeds: [
                    globalEmbeds.regular(
                        `${config.emojis.success} ${message.author}: The **voice level** for **Level ${level}** has been set to ${role}.`
                    )
                ]
            });

        } catch (error) {

            console.error(
                "[SET VC] Failed to save VC tier:",
                error
            );

            return message.channel.send({
                embeds: [
                    globalEmbeds.error(
                        `${message.author}: I couldn't save the **voice level**.`
                    )
                ]
            });

        }

    }

};
