const {
    EmbedBuilder
} = require("discord.js");

const config =
    require("../../config");

const Snipe =
    require("../../events/snipe");

const SnipeCommand =
    require("../../commands/utility/snipe");


module.exports = {

    name: "snipe",

    type: "button",

    async execute(
        client,
        interaction
    ) {

        const parts =
            interaction.customId.split(":");

        const direction =
            parts[1];

        const ownerId =
            parts[2];

        const currentIndex =
            Number(parts[3]);


        if (
            interaction.user.id !==
            ownerId
        ) {

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(
                            config.colors.error
                        )
                        .setDescription(
                            `${config.emojis.error} ${interaction.user}: You cannot use this button.`
                        )
                ],
                flags: 64
            });

        }


        const snipes =
            Snipe.get(
                interaction.guild.id,
                interaction.channel.id
            ).filter(
                snipe =>
                    Date.now() -
                    snipe.deletedTimestamp <=
                    2 * 60 * 60 * 1000
            );


        if (!snipes.length) {

            return interaction.update({
                components: []
            }).catch(
                () => null
            );

        }


        let index =
            currentIndex;


        if (
            direction === "next"
        ) {

            index =
                Math.min(
                    index + 1,
                    snipes.length - 1
                );

        }


        if (
            direction === "previous"
        ) {

            index =
                Math.max(
                    index - 1,
                    0
                );

        }


        await interaction.update({

            embeds: [
                SnipeCommand.createEmbed(
                    snipes[index],
                    interaction.user,
                    index,
                    snipes.length
                )
            ],

            components:
                SnipeCommand.createButtons(
                    ownerId,
                    index,
                    snipes.length
                )

        });


        setTimeout(
            () => {

                interaction.message
                    .edit({
                        components: []
                    })
                    .catch(
                        () => null
                    );

            },
            60 * 1000
        );

    }

};
