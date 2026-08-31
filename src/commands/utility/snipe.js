const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require("discord.js");

const config =
    require("../../config");

const Snipe =
    require("../../events/snipe");


const TWO_HOURS =
    2 * 60 * 60 * 1000;

const SIXTY_SECONDS =
    60 * 1000;


function randomColor() {

    return Math.floor(
        Math.random() * 0xFFFFFF
    );

}


function timeAgo(
    timestamp
) {

    const seconds =
        Math.floor(
            (Date.now() - timestamp) / 1000
        );

    if (seconds < 1) {
        return "just now";
    }

    if (seconds < 60) {
        return `${seconds} second${seconds === 1 ? "" : "s"} ago`;
    }

    const minutes =
        Math.floor(seconds / 60);

    if (minutes < 60) {
        return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    }

    const hours =
        Math.floor(minutes / 60);

    return `${hours} hour${hours === 1 ? "" : "s"} ago`;

}


function createEmbed(
    snipe,
    runner,
    index,
    total
) {

    const embed =
        new EmbedBuilder()
            .setColor(
                randomColor()
            )
            .setAuthor({
                name:
                    snipe.author.username,

                iconURL:
                    snipe.author.avatar
            })
            .setFooter({
                text:
                    `Deleted ${timeAgo(snipe.deletedTimestamp)} • ${index + 1}/${total} messages`,

                iconURL:
                    runner.displayAvatarURL({
                        dynamic: true
                    })
            });

    embed.setDescription(
        snipe.content ||
        "*No message content.*"
    );


    if (
        snipe.attachments?.length
    ) {

        embed.addFields({
            name:
                "Attachments",

            value:
                snipe.attachments
                    .map(
                        url =>
                            `[Attachment](${url})`
                    )
                    .join("\n")
        });

    }


    return embed;

}


function createButtons(
    ownerId,
    index,
    total
) {

    if (
        total <= 1
    ) {

        return [];

    }


    return [
        new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId(
                        `snipe:previous:${ownerId}:${index}`
                    )
                    .setLabel(
                        "<"
                    )
                    .setStyle(
                        ButtonStyle.Secondary
                    )
                    .setDisabled(
                        index <= 0
                    ),

                new ButtonBuilder()
                    .setCustomId(
                        `snipe:next:${ownerId}:${index}`
                    )
                    .setLabel(
                        ">"
                    )
                    .setStyle(
                        ButtonStyle.Secondary
                    )
                    .setDisabled(
                        index >= total - 1
                    )

            )
    ];

}


module.exports = {

    name:
        "snipe",

    aliases: [
        "s"
    ],

    async execute(
        client,
        message,
        args
    ) {

        if (
            !message.guild
        ) {

            return;

        }


        const stored =
            Snipe.get(
                message.guild.id,
                message.channel.id
            );


        const snipes =
            stored.filter(
                snipe =>
                    Date.now() -
                    snipe.deletedTimestamp <=
                    TWO_HOURS
            );


        if (
            !snipes.length
        ) {

            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(
                            config.colors.error
                        )
                        .setDescription(
                            `${config.emojis.error} ${message.author}: There is **nothing to snipe** from the last **2 hours** in this channel.`
                        )
                ]
            });

        }


        const sent =
            await message.channel.send({

                embeds: [
                    createEmbed(
                        snipes[0],
                        message.author,
                        0,
                        snipes.length
                    )
                ],

                components:
                    createButtons(
                        message.author.id,
                        0,
                        snipes.length
                    )

            });


        /*
         * Remove buttons after 60 seconds.
         * Keep the embed.
         */

        setTimeout(
            () => {

                sent.edit({
                    components: []
                }).catch(
                    () => null
                );

            },
            SIXTY_SECONDS
        );


        return sent;

    },


    createEmbed,

    createButtons

};
