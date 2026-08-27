// src/embeds/help/moderation.js

const { EmbedBuilder } = require("discord.js");
const config = require("../../config");

module.exports = {

    ban(user) {
        return new EmbedBuilder()
            .setTitle("Command: ban")
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({ dynamic: true })
            })
            .setColor(config.colors.regular)
            .setDescription(
`Ban a user from the server.
\`\`\`
Syntax:
${config.prefix}ban [member] [reason]
Example:
${config.prefix}ban @user spam
\`\`\``
            );
    },


    unban(user) {
        return new EmbedBuilder()
            .setTitle("Command: unban")
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({ dynamic: true })
            })
            .setColor(config.colors.regular)
            .setDescription(
`Unban a user from the server.
\`\`\`
Syntax:
${config.prefix}unban [member]
Example:
${config.prefix}unban 123456789012345678
\`\`\``
            );
    },


    kick(user) {
        return new EmbedBuilder()
            .setTitle("Command: kick")
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({ dynamic: true })
            })
            .setColor(config.colors.regular)
            .setDescription(
`Kick a user from the server.
\`\`\`
Syntax:
${config.prefix}kick [member] [reason]
Example:
${config.prefix}kick @user spam
\`\`\``
            );
    },


    softban(user) {
        return new EmbedBuilder()
            .setTitle("Command: softban")
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({ dynamic: true })
            })
            .setColor(config.colors.regular)
            .setDescription(
`Ban and immediately unban a user.
\`\`\`
Syntax:
${config.prefix}softban [member] [reason]
Example:
${config.prefix}softban @user spam
\`\`\``
            );
    },


    hardban(user) {
        return new EmbedBuilder()
            .setTitle("Command: hardban")
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({ dynamic: true })
            })
            .setColor(config.colors.regular)
            .setDescription(
`Ban a user and delete their recent messages.
\`\`\`
Syntax:
${config.prefix}hardban [member] [reason]
Example:
${config.prefix}hardban @user spam
\`\`\``
            );
    },


    timeout(user) {
        return new EmbedBuilder()
            .setTitle("Command: timeout")
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({ dynamic: true })
            })
            .setColor(config.colors.regular)
            .setDescription(
`Timeout a user.
\`\`\`
Syntax:
${config.prefix}timeout [member] [duration] [reason]
Example:
${config.prefix}timeout @user 10m spam
\`\`\``
            );
    },


    untimeout(user) {
        return new EmbedBuilder()
            .setTitle("Command: untimeout")
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({ dynamic: true })
            })
            .setColor(config.colors.regular)
            .setDescription(
`Remove a user's timeout.
\`\`\`
Syntax:
${config.prefix}untimeout [member]
Example:
${config.prefix}untimeout @user
\`\`\``
            );
    },


    warn(user) {
        return new EmbedBuilder()
            .setTitle("Command: warn")
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({ dynamic: true })
            })
            .setColor(config.colors.regular)
            .setDescription(
`Warn a user.
\`\`\`
Syntax:
${config.prefix}warn [member] [reason]
Example:
${config.prefix}warn @user spam
\`\`\``
            );
    },


    warnings(user) {
        return new EmbedBuilder()
            .setTitle("Command: warnings")
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({ dynamic: true })
            })
            .setColor(config.colors.regular)
            .setDescription(
`View a user's warnings.
\`\`\`
Syntax:
${config.prefix}warnings [member]
Example:
${config.prefix}warnings @user
\`\`\``
            );
    },


    clearwarns(user) {
        return new EmbedBuilder()
            .setTitle("Command: clearwarns")
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({ dynamic: true })
            })
            .setColor(config.colors.regular)
            .setDescription(
`Clear all warnings from a user.
\`\`\`
Syntax:
${config.prefix}clearwarns [member]
Example:
${config.prefix}clearwarns @user
\`\`\``
            );
    },


    clear(user) {
        return new EmbedBuilder()
            .setTitle("Command: clear")
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({ dynamic: true })
            })
            .setColor(config.colors.regular)
            .setDescription(
`Delete messages from a channel.
\`\`\`
Syntax:
${config.prefix}clear [amount]
Example:
${config.prefix}clear 50
\`\`\``
            );
    },


    purge(user) {
        return new EmbedBuilder()
            .setTitle("Command: purge")
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({ dynamic: true })
            })
            .setColor(config.colors.regular)
            .setDescription(
`Delete multiple messages from a channel.
\`\`\`
Syntax:
${config.prefix}purge [amount]
Example:
${config.prefix}purge 100
\`\`\``
            );
    },


    slowmode(user) {
        return new EmbedBuilder()
            .setTitle("Command: slowmode")
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({ dynamic: true })
            })
            .setColor(config.colors.regular)
            .setDescription(
`Set the slowmode for a channel.
\`\`\`
Syntax:
${config.prefix}slowmode [duration]
Example:
${config.prefix}slowmode 10s
\`\`\``
            );
    },


    lock(user) {
        return new EmbedBuilder()
            .setTitle("Command: lock")
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({ dynamic: true })
            })
            .setColor(config.colors.regular)
            .setDescription(
`Lock a channel.
\`\`\`
Syntax:
${config.prefix}lock
Example:
${config.prefix}lock
\`\`\``
            );
    },


    unlock(user) {
        return new EmbedBuilder()
            .setTitle("Command: unlock")
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({ dynamic: true })
            })
            .setColor(config.colors.regular)
            .setDescription(
`Unlock a channel.
\`\`\`
Syntax:
${config.prefix}unlock
Example:
${config.prefix}unlock
\`\`\``
            );
    },


    hide(user) {
        return new EmbedBuilder()
            .setTitle("Command: hide")
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({ dynamic: true })
            })
            .setColor(config.colors.regular)
            .setDescription(
`Hide a channel from @everyone.
\`\`\`
Syntax:
${config.prefix}hide
Example:
${config.prefix}hide
\`\`\``
            );
    },


    unhide(user) {
        return new EmbedBuilder()
            .setTitle("Command: unhide")
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({ dynamic: true })
            })
            .setColor(config.colors.regular)
            .setDescription(
`Unhide a channel for @everyone.
\`\`\`
Syntax:
${config.prefix}unhide
Example:
${config.prefix}unhide
\`\`\``
            );
    },


    nuke(user) {
        return new EmbedBuilder()
            .setTitle("Command: nuke")
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({ dynamic: true })
            })
            .setColor(config.colors.regular)
            .setDescription(
`Clear all messages from a channel.
\`\`\`
Syntax:
${config.prefix}nuke
Example:
${config.prefix}nuke
\`\`\``
            );
    },


    strip(user) {
        return new EmbedBuilder()
            .setTitle("Command: strip")
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({ dynamic: true })
            })
            .setColor(config.colors.regular)
            .setDescription(
`Remove all removable roles from a user.
\`\`\`
Syntax:
${config.prefix}strip [member]
Example:
${config.prefix}strip @user
\`\`\``
            );
    },


    nick(user) {
        return new EmbedBuilder()
            .setTitle("Command: nick")
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({ dynamic: true })
            })
            .setColor(config.colors.regular)
            .setDescription(
`Change a user's nickname.
\`\`\`
Syntax:
${config.prefix}nick [member] [nickname]
Example:
${config.prefix}nick @user Cool Name
\`\`\``
            );
    }

};
