const config = require("../../config");
const messages = require("../../systems/messages/interaction");

module.exports = {

    name: "message-modal",

    type: "modal",

    async execute(interaction) {

        if (!interaction.guild) {

            return messages.reply(
                interaction,
                {
                    content:
                        `${config.emojis.error} ${interaction.user}: this can only be used in a server.`
                }
            );

        }

        return messages.reply(
            interaction,
            {
                content:
                    `${config.emojis.success} ${interaction.user}: modal interaction received.`
            }
        );

    }

};
