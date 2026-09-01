const {
    EmbedBuilder
} = require("discord.js");

const config =
    require("../../config");

const VCSystem =
    require("../../systems/voiceLevel");

module.exports = {

    name: "stats",

    async execute(client, message) {

        const member =
            message.member;

        const stats =
            await VCSystem.getStats(
                message.guild.id,
                member.id
            );

        const tier =
            await VCSystem.getTier(
                message.guild,
                stats.level
            );

        const embed =
            new EmbedBuilder()

                .setTitle(
                    `${member.user.username}'s VC Stats`
                )

                .setThumbnail(
                    member.user.displayAvatarURL({
                        dynamic: true,
                        size: 256
                    })
                )

                .setDescription(
                    "This only counts if you are **unmuted** and **undeafened**."
                )

                .addFields(
                    {
                        name:
                            "Current Tier",

                        value:
                            `> ${tier.name}`,

                        inline:
                            false
                    },
                    {
                        name:
                            "\u200b",

                        value:
                            `**All Time**: ${VCSystem.formatTime(stats.allTime)}\n` +
                            `**Today**: ${VCSystem.formatTime(stats.today)}`,

                        inline:
                            false
                    }
                )

                .setColor(
                    config.colors.regular
                );

        return message.reply({
            embeds: [
                embed
            ]
        });

    }

};
