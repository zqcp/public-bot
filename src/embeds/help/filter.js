// src/embeds/help/filter.js

const { EmbedBuilder } = require("discord.js");
const config = require("../../config");

module.exports = {

    add(user) {
        return new EmbedBuilder()
            .setTitle("Command: filter add")
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({ dynamic: true })
            })
            .setColor(config.colors.regular)
            .setDescription(
`Add a word to the server's filter.
\`\`\`
Syntax:
${config.prefix}filter add [word]
Example:
${config.prefix}filter add spam
\`\`\``
            );
    },


    remove(user) {
        return new EmbedBuilder()
            .setTitle("Command: filter remove")
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({ dynamic: true })
            })
            .setColor(config.colors.regular)
            .setDescription(
`Remove a word from the server's filter.
\`\`\`
Syntax:
${config.prefix}filter remove [word]
Example:
${config.prefix}filter remove spam
\`\`\``
            );
    },


    list(user) {
        return new EmbedBuilder()
            .setTitle("Command: filter list")
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({ dynamic: true })
            })
            .setColor(config.colors.regular)
            .setDescription(
`View all filtered words.
\`\`\`
Syntax:
${config.prefix}filter list
Example:
${config.prefix}filter list
\`\`\``
            );
    },


    enable(user) {
        return new EmbedBuilder()
            .setTitle("Command: filter enable")
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({ dynamic: true })
            })
            .setColor(config.colors.regular)
            .setDescription(
`Enable the server's word filter.
\`\`\`
Syntax:
${config.prefix}filter enable
Example:
${config.prefix}filter enable
\`\`\``
            );
    },


    disable(user) {
        return new EmbedBuilder()
            .setTitle("Command: filter disable")
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({ dynamic: true })
            })
            .setColor(config.colors.regular)
            .setDescription(
`Disable the server's word filter.
\`\`\`
Syntax:
${config.prefix}filter disable
Example:
${config.prefix}filter disable
\`\`\``
            );
    }

};
