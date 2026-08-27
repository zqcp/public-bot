// src/embeds/help/filter.js

const { EmbedBuilder } = require("discord.js");
const config = require("../../config");

module.exports = {

    filter(user) {
        return new EmbedBuilder()
            .setTitle("Command: filter")
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({ dynamic: true })
            })
            .setColor(config.colors.regular)
            .setDescription(
`Manage the server's word filter.
\`\`\`r
Syntax:
${config.prefix}filter [option]
Example:
${config.prefix}filter add spam
Options:
add, remove, list, clear, toggle
\`\`\``
            );
    },


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


    clear(user) {
        return new EmbedBuilder()
            .setTitle("Command: filter clear")
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({ dynamic: true })
            })
            .setColor(config.colors.regular)
            .setDescription(
`Clear all filtered words from the server.
\`\`\`
Syntax:
${config.prefix}filter clear
Example:
${config.prefix}filter clear
\`\`\``
            );
    },


    toggle(user) {
        return new EmbedBuilder()
            .setTitle("Command: filter toggle")
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({ dynamic: true })
            })
            .setColor(config.colors.regular)
            .setDescription(
`Enable or disable the server's word filter.
\`\`\`
Syntax:
${config.prefix}filter toggle [on/off]
Example:
${config.prefix}filter toggle on
${config.prefix}filter toggle off
\`\`\``
            );
    }

};
