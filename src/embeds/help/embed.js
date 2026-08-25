const { EmbedBuilder } = require("discord.js");
const config = require("../../config");

module.exports = {

    create(user) {
        return new EmbedBuilder()
            .setTitle("Command: embed create")
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({
                    dynamic: true
                })
            })
            .setColor(config.colors.regular)
            .setDescription(
`Create a custom message with embeds, buttons, select menus, fields, authors and more.
\`\`\`
Syntax:
${config.prefix}embed create
Example:
${config.prefix}embed create
\`\`\``
            );
    },

    edit(user) {
        return new EmbedBuilder()
            .setTitle("Command: embed edit")
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({
                    dynamic: true
                })
            })
            .setColor(config.colors.regular)
            .setDescription(
`Edit a saved embed message.
\`\`\`
Syntax:
${config.prefix}embed edit [name]
Example:
${config.prefix}embed edit welcome
\`\`\``
            );
    },

    preview(user) {
        return new EmbedBuilder()
            .setTitle("Command: embed preview")
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({
                    dynamic: true
                })
            })
            .setColor(config.colors.regular)
            .setDescription(
`Preview a saved embed message.
\`\`\`
Syntax:
${config.prefix}embed preview [name]
Example:
${config.prefix}embed preview welcome
\`\`\``
            );
    },

    delete(user) {
        return new EmbedBuilder()
            .setTitle("Command: embed delete")
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({
                    dynamic: true
                })
            })
            .setColor(config.colors.regular)
            .setDescription(
`Delete a saved embed message.
\`\`\`
Syntax:
${config.prefix}embed delete [name]
Example:
${config.prefix}embed delete welcome
\`\`\``
            );
    },

    send(user) {
        return new EmbedBuilder()
            .setTitle("Command: embed send")
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({
                    dynamic: true
                })
            })
            .setColor(config.colors.regular)
            .setDescription(
`Send a saved embed message to a channel.
\`\`\`
Syntax:
${config.prefix}embed send [name] [channel]
Example:
${config.prefix}embed send welcome #general
\`\`\``
            );
    }

};
