const config = require("../../config");

module.exports = {

    permit(user) {
        return {
            title: "Command: vc permit",
            author: {
                name: user.username,
                icon_url: user.displayAvatarURL({
                    dynamic: true
                })
            },
            color: config.colors.regular,
            description:
`Permit a member to join your voice channel.
\`\`\`
Syntax:
${config.prefix}vc permit [member]

Example:
${config.prefix}vc permit @User
${config.prefix}vc permit 123456789012345678
${config.prefix}vc permit username

Member:
Mention, ID, or username
\`\`\``
        };
    },


    reject(user) {
        return {
            title: "Command: vc reject",
            author: {
                name: user.username,
                icon_url: user.displayAvatarURL({
                    dynamic: true
                })
            },
            color: config.colors.regular,
            description:
`Remove a member's permission to join your voice channel.
\`\`\`
Syntax:
${config.prefix}vc reject [member]

Example:
${config.prefix}vc reject @User
${config.prefix}vc reject 123456789012345678
${config.prefix}vc reject username

Member:
Mention, ID, or username
\`\`\``
        };
    }

};
