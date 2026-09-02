// src/events/voiceLevel.js

const {
    EmbedBuilder
} = require("discord.js");

const config =
    require("../config");


module.exports = {

    levelUp(
        user,
        level,
        roleName = null
    ) {

        return new EmbedBuilder()

            .setColor(
                config.colors.regular
            )

            .setAuthor({
                name:
                    user.username,

                iconURL:
                    user.displayAvatarURL({
                        dynamic: true
                    })
            })

            .setThumbnail(
                user.displayAvatarURL({
                    dynamic: true,
                    size: 256
                })
            )

            .setDescription(
                `Congrats ${user}, you reached voice level \`${level}\`!` +
                (
                    roleName
                        ? `\n\nYou earned the **${roleName}** rank!`
                        : ""
                )
            );

    }

};
