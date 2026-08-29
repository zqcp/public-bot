const {
    PermissionFlagsBits
} = require("discord.js");

const VoiceMaster =
    require("../../models/VoiceMaster");

const VoiceChannel =
    require("../../models/VoiceChannel");

const Channels =
    require("./channels");

const Ownership =
    require("./ownership");

const Permissions =
    require("./permissions");


async function handleJoinToCreate(
    member,
    config
) {

    if (
        member.voice.channelId !==
        config.joinToCreateId
    ) {
        return;
    }

    await Channels.create(
        member,
        config
    );

}


async function handleRejectedAdmin(
    member
) {

    if (
        !member.permissions.has(
            PermissionFlagsBits.Administrator
        )
    ) {
        return;
    }


    const channel =
        member.voice.channel;


    if (!channel) {
        return;
    }


    const overwrite =
        channel.permissionOverwrites.cache.get(
            member.id
        );


    if (
        !overwrite ||
        !overwrite.deny.has(
            PermissionFlagsBits.Connect
        )
    ) {
        return;
    }


    await member.voice.setChannel(
        null
    ).catch(
        () => null
    );

}


async function handleUnmute(
    member,
    config
) {

    if (
        member.voice.channelId !==
        config.unmuteId &&
        member.voice.channelId !==
        config.unmute2Id
    ) {
        return;
    }

    if (
        !member.voice.serverMute &&
        !member.voice.serverDeaf
    ) {
        return;
    }


    const original =
        await VoiceChannel.findOne({

            guildId:
                member.guild.id,

            ownerId:
                member.id

        });


    if (!original) {
        return;
    }


    const channel =
        await member.guild.channels.fetch(
            original.channelId
        ).catch(
            () => null
        );


    if (!channel) {
        return;
    }


    if (
        member.voice.serverMute
    ) {

        await member.voice.setMute(
            false
        ).catch(
            () => null
        );

    }


    if (
        member.voice.serverDeaf
    ) {

        await member.voice.setDeaf(
            false
        ).catch(
            () => null
        );

    }


    await member.voice.setChannel(
        channel
    ).catch(
        () => null
    );

}


async function handleRandom(
    member,
    config
) {

    if (
        member.voice.channelId !==
        config.randomId
    ) {
        return;
    }


    const channels =
        await VoiceChannel.find({
            guildId:
                member.guild.id
        });


    const available = [];


    for (
        const data of channels
    ) {

        const channel =
            member.guild.channels.cache.get(
                data.channelId
            );


        if (!channel) {
            continue;
        }


        if (
            channel.members.size >=
            channel.userLimit &&
            channel.userLimit !== 0
        ) {
            continue;
        }


        if (
            !Permissions.canJoin(
                channel,
                member
            )
        ) {
            continue;
        }


        available.push(
            channel
        );

    }


    if (!available.length) {
        return;
    }


    const channel =
        available[
            Math.floor(
                Math.random() *
                available.length
            )
        ];


    await member.voice.setChannel(
        channel
    );

}


async function handleLeave(
    oldChannel
) {

    if (!oldChannel) {
        return;
    }


    const data =
        await VoiceChannel.findOne({
            guildId:
                oldChannel.guild.id,

            channelId:
                oldChannel.id
        });


    if (!data) {
        return;
    }


    await Channels.cleanup(
        oldChannel
    );

}


async function handle(
    oldState,
    newState
) {

    const member =
        newState.member ||
        oldState.member;

    if (!member) {
        return;
    }


    const config =
        await VoiceMaster.findOne({
            guildId:
                member.guild.id
        });

    if (!config) {
        return;
    }


    if (
        newState.channelId
    ) {

        await handleRejectedAdmin(
            member
        );


        if (
            !member.voice.channelId
        ) {
            return;
        }


        await handleJoinToCreate(
            member,
            config
        );


        await handleUnmute(
            member,
            config
        );


        await handleRandom(
            member,
            config
        );

    }


    if (
        oldState.channelId &&
        oldState.channelId !==
        newState.channelId
    ) {

        await handleLeave(
            oldState.channel
        );

    }

}


module.exports = {
    handle
};
