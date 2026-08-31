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

    /*
     * User must be inside either
     * configured unmute channel.
     */

    if (
        member.voice.channelId !==
        config.unmuteId &&
        member.voice.channelId !==
        config.unmute2Id
    ) {
        return;
    }

    /*
     * Find the temporary VC owned
     * by this member.
     *
     * This is intentionally done even
     * if the member is not muted yet.
     */

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

    /*
     * Get their original VC.
     */

    const channel =
        await member.guild.channels.fetch(
            original.channelId
        ).catch(
            () => null
        );

    if (!channel) {
        return;
    }

    /*
     * Unmute.
     */

    if (
        member.voice.serverMute
    ) {

        await member.voice.setMute(
            false
        ).catch(
            () => null
        );

    }

    /*
     * Undeafen.
     */

    if (
        member.voice.serverDeaf
    ) {

        await member.voice.setDeaf(
            false
        ).catch(
            () => null
        );

    }

    /*
     * Return them to their
     * original temporary VC.
     */

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

    /*
     * Someone joined/moved into
     * a voice channel.
     */

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

        /*
         * Join to Create.
         */

        await handleJoinToCreate(
            member,
            config
        );

        /*
         * Unmute / return to VC.
         */

        await handleUnmute(
            member,
            config
        );

        /*
         * Random VC.
         */

        await handleRandom(
            member,
            config
        );

    }

    /*
     * Someone left or moved out
     * of a tracked temporary VC.
     */

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
