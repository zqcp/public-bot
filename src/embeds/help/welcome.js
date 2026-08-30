const {
    EmbedBuilder
} = require("discord.js");

const config =
    require("../../config");

module.exports = {

    welcome(user) {

        return new EmbedBuilder()

            .setTitle(
                "Command: welcome"
            )

            .setAuthor({
                name:
                    user.username,

                iconURL:
                    user.displayAvatarURL({
                        dynamic: true
                    })
            })

            .setColor(
                config.colors.regular
            )

            .setDescription(
`Manage the server's welcome system.
\`\`\`r
Syntax:
${config.prefix}welcome [option]
Example:
${config.prefix}welcome set #welcome

Options:
set, message, enable, disable
\`\`\``
            );

    },

    set(user) {

        return new EmbedBuilder()

            .setTitle(
                "Command: welcome set"
            )

            .setAuthor({
                name:
                    user.username,

                iconURL:
                    user.displayAvatarURL({
                        dynamic: true
                    })
            })

            .setColor(
                config.colors.regular
            )

            .setDescription(
`Set the channel where welcome messages are sent.
\`\`\`r
Syntax:
${config.prefix}welcome set [channel]
Example:
${config.prefix}welcome set #welcome
\`\`\``
            );

    },

    message(user) {

        return new EmbedBuilder()

            .setTitle(
                "Command: welcome message"
            )

            .setAuthor({
                name:
                    user.username,

                iconURL:
                    user.displayAvatarURL({
                        dynamic: true
                    })
            })

            .setColor(
                config.colors.regular
            )

            .setDescription(
`Set the embed used for welcome messages.
\`\`\`r
Syntax:
${config.prefix}welcome message [embed]
Example:
${config.prefix}welcome message welcome
\`\`\``
            );

    },

    enable(user) {

        return new EmbedBuilder()

            .setTitle(
                "Command: welcome enable"
            )

            .setAuthor({
                name:
                    user.username,

                iconURL:
                    user.displayAvatarURL({
                        dynamic: true
                    })
            })

            .setColor(
                config.colors.regular
            )

            .setDescription(
`Enable the welcome system.
\`\`\`r
Syntax:
${config.prefix}welcome enable
Example:
${config.prefix}welcome enable
\`\`\``
            );

    },

    disable(user) {

        return new EmbedBuilder()

            .setTitle(
                "Command: welcome disable"
            )

            .setAuthor({
                name:
                    user.username,

                iconURL:
                    user.displayAvatarURL({
                        dynamic: true
                    })
            })

            .setColor(
                config.colors.regular
            )

            .setDescription(
`Disable the welcome system.
\`\`\`r
Syntax:
${config.prefix}welcome disable
Example:
${config.prefix}welcome disable
\`\`\``
            );

    }

};
