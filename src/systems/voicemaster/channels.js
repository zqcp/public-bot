const VoiceChannel =
    require("../../models/VoiceChannel");

const Ownership =
    require("./ownership");


function getCategory(
    guild,
    config,
    type
) {

    if (
        type === "private" &&
        config.privateCategoryId
    ) {

        const category =
            guild.channels.cache.get(
                config.privateCategoryId
            );

        if (category) {
            return category;
        }

    }


    if (
        type === "public" &&
        config.publicCategoryId
    ) {

        const category =
            guild.channels.cache.get(
                config.publicCategoryId
            );

        if (category) {
            return category;
        }

    }


    return guild.channels.cache.get(
        config.defaultCategoryId
    ) || null;

}


async function create(
    member,
    config
) {

    const category =
        getCategory(
            member.guild,
            config,
            "public"
        );

    const channel =
        await member.guild.channels.create({

            name:
                `${member.displayName}'s room`,

            type: 2,

            parent:
                category?.id || null,

            permissionOverwrites: []

        });


    await Ownership.create(
        member.guild.id,
        channel.id,
        member.id
    );


    await member.voice.setChannel(
        channel
    );


    return channel;

}


async function move(
    channel,
    config,
    type
) {

    const category =
        getCategory(
            channel.guild,
            config,
            type
        );

    if (!category) {
        return channel;
    }

    if (
        channel.parentId !== category.id
    ) {

        await channel.setParent(
            category.id,
            {
                lockPermissions: false
            }
        );

    }

    return channel;

}


async function remove(
    channel
) {

    await Ownership.remove(
        channel.guild.id,
        channel.id
    );


    if (
        channel.deletable
    ) {

        await channel.delete();

    }

}


async function isEmpty(
    channel
) {

    return channel.members.size === 0;

}


async function cleanup(
    channel
) {

    if (
        await isEmpty(channel)
    ) {

        const data =
            await VoiceChannel.findOne({
                guildId:
                    channel.guild.id,

                channelId:
                    channel.id
            });

        if (data) {
            await remove(channel);
        }

    }

}


module.exports = {
    getCategory,
    create,
    move,
    remove,
    isEmpty,
    cleanup
};
