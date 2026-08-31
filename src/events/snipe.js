const snipes =
    new Map();

const MAX_SNIPES =
    25;


module.exports = {

    name: "messageDelete",

    once: false,

    async execute(
        message
    ) {

        if (
            !message.guild ||
            message.author?.bot
        ) {
            return;
        }


        if (
            !message.content &&
            !message.attachments.size
        ) {
            return;
        }


        if (
            !snipes.has(
                message.guild.id
            )
        ) {

            snipes.set(
                message.guild.id,
                new Map()
            );

        }


        const guildSnipes =
            snipes.get(
                message.guild.id
            );


        if (
            !guildSnipes.has(
                message.channel.id
            )
        ) {

            guildSnipes.set(
                message.channel.id,
                []
            );

        }


        const channelSnipes =
            guildSnipes.get(
                message.channel.id
            );


        channelSnipes.unshift({

            content:
                message.content ||
                null,

            author: {

                id:
                    message.author.id,

                username:
                    message.author.username,

                tag:
                    message.author.tag,

                avatar:
                    message.author.displayAvatarURL({
                        dynamic: true
                    })

            },

            attachments:
                [...message.attachments.values()]
                    .map(
                        attachment =>
                            attachment.url
                    ),

            deletedTimestamp:
                Date.now()

        });


        if (
            channelSnipes.length >
            MAX_SNIPES
        ) {

            channelSnipes.pop();

        }

    },


    get(
        guildId,
        channelId
    ) {

        return snipes
            .get(
                guildId
            )
            ?.get(
                channelId
            ) || [];

    },


    clear(
        guildId,
        channelId
    ) {

        const guildSnipes =
            snipes.get(
                guildId
            );


        if (!guildSnipes) {
            return false;
        }


        const deleted =
            guildSnipes.delete(
                channelId
            );


        if (
            guildSnipes.size === 0
        ) {

            snipes.delete(
                guildId
            );

        }


        return deleted;

    }

};
