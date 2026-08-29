const VoiceChannel =
    require("../../models/VoiceChannel");

async function create(
    guildId,
    channelId,
    ownerId
) {

    return VoiceChannel.create({
        guildId,
        channelId,
        ownerId
    });

}


async function get(
    guildId,
    channelId
) {

    return VoiceChannel.findOne({
        guildId,
        channelId
    });

}


async function setOwner(
    guildId,
    channelId,
    ownerId
) {

    return VoiceChannel.findOneAndUpdate(
        {
            guildId,
            channelId
        },
        {
            ownerId
        },
        {
            new: true,
            upsert: true
        }
    );

}


async function clearOwner(
    guildId,
    channelId
) {

    return VoiceChannel.findOneAndUpdate(
        {
            guildId,
            channelId
        },
        {
            ownerId: null
        },
        {
            new: true
        }
    );

}


async function remove(
    guildId,
    channelId
) {

    return VoiceChannel.deleteOne({
        guildId,
        channelId
    });

}


async function claim(
    guildId,
    channelId,
    userId
) {

    const data =
        await get(
            guildId,
            channelId
        );

    if (!data) {
        return null;
    }

    if (data.ownerId) {
        return null;
    }

    data.ownerId =
        userId;

    await data.save();

    return data;

}


async function transfer(
    guildId,
    channelId,
    userId
) {

    return setOwner(
        guildId,
        channelId,
        userId
    );

}


module.exports = {
    create,
    get,
    setOwner,
    clearOwner,
    remove,
    claim,
    transfer
};
