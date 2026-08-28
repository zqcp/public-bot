// src/embeds/help/jail.js

const {
    EmbedBuilder
} = require("discord.js");

const config =
    require("../../config");

module.exports = {

    jail(user) {

        return new EmbedBuilder()
            .setTitle("Command: jail")
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({
                    dynamic: true
                })
            })
            .setColor(
                config.colors.regular
            )
            .setDescription(
`Jail a member in the server.
\`\`\`
Syntax:
${config.prefix}jail [member] [reason]
Example:
${config.prefix}jail @user spam
\`\`\``
            );

    },


    setup(user) {

        return new EmbedBuilder()
            .setTitle("Command: jail setup")
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({
                    dynamic: true
                })
            })
            .setColor(
                config.colors.regular
            )
            .setDescription(
`Set up the server's jail system.
\`\`\`
Syntax:
${config.prefix}jail setup
Example:
${config.prefix}jail setup
\`\`\``
            );

    },


    unsetup(user) {

        return new EmbedBuilder()
            .setTitle("Command: jail unsetup")
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({
                    dynamic: true
                })
            })
            .setColor(
                config.colors.regular
            )
            .setDescription(
`Remove the server's jail system.
\`\`\`
Syntax:
${config.prefix}jail unsetup
Example:
${config.prefix}jail unsetup
\`\`\``
            );

    },


    unjail(user) {

        return new EmbedBuilder()
            .setTitle("Command: unjail")
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({
                    dynamic: true
                })
            })
            .setColor(
                config.colors.regular
            )
            .setDescription(
`Remove a member from jail.
\`\`\`
Syntax:
${config.prefix}unjail [member]
Example:
${config.prefix}unjail @user
\`\`\``
            );

    }

};
