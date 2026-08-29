const {
    ChannelType,
    EmbedBuilder
} = require("discord.js");

const VoiceMaster =
    require("../../models/VoiceMaster");

const Interface =
    require("../../systems/voicemaster/interface");

const globalEmbeds =
    require("../../embeds/global");

const config =
    require("../../config");

module.exports = {

    name: "vmsetup",

    aliases: ["voicemaster setup"],

    permissions: {
        user: ["ManageGuild"],
        bot: ["ManageChannels"]
    },

    async execute(
        client,
        message,
        args
    ) {

        /*
         * Guild only
         */

        if (!message.guild) {
            return;
        }

        /*
         * User permission
         */

        if (
            !message.member.permissions.has(
                "ManageGuild"
            )
        ) {

            return message.channel.send({
                embeds: [
                    globalEmbeds.permission(
                        message.author,
                        "Manage Server"
                    )
                ]
            });

        }

        /*
         * Check existing setup
         */

        const existing =
            await VoiceMaster.findOne({
                guildId:
                    message.guild.id
            });

        if (existing) {

            const embed =
                new EmbedBuilder()
                    .setColor(
                        config.colors.error
                    )
                    .setDescription(
                        `${config.emojis.error} ${message.author}: VoiceMaster is already **set up** in this server.`
                    );

            return message.channel.send({
                embeds: [embed]
            });

        }

        /*
         * Create VoiceMaster category
         */

        let category;

        try {

            category =
                await message.guild.channels.create({
                    name:
                        "Voice Channels",

                    type:
                        ChannelType.GuildCategory,

                    reason:
                        "VoiceMaster setup"
                });

        } catch (error) {

            console.error(
                "[VOICEMASTER] Failed to create category:",
                error
            );

            const embed =
                new EmbedBuilder()
                    .setColor(
                        config.colors.failed
                    )
                    .setDescription(
                        `${config.emojis.failed} ${message.author}: Failed to create the VoiceMaster **category**.`
                    );

            return message.channel.send({
                embeds: [embed]
            });

        }

        /*
         * Create interface channel
         */

        let interfaceChannel;

        try {

            interfaceChannel =
                await message.guild.channels.create({
                    name:
                        "interface",

                    type:
                        ChannelType.GuildText,

                    parent:
                        category.id,

                    reason:
                        "VoiceMaster setup"
                });

        } catch (error) {

            console.error(
                "[VOICEMASTER] Failed to create interface channel:",
                error
            );

            await category.delete().catch(() => {});

            const embed =
                new EmbedBuilder()
                    .setColor(
                        config.colors.failed
                    )
                    .setDescription(
                        `${config.emojis.failed} ${message.author}: Failed to create the VoiceMaster **interface channel**.`
                    );

            return message.channel.send({
                embeds: [embed]
            });

        }

        /*
         * Create Join to Create channel
         */

        let joinToCreate;

        try {

            joinToCreate =
                await message.guild.channels.create({
                    name:
                        "Join to Create",

                    type:
                        ChannelType.GuildVoice,

                    parent:
                        category.id,

                    reason:
                        "VoiceMaster setup"
                });

        } catch (error) {

            console.error(
                "[VOICEMASTER] Failed to create Join to Create:",
                error
            );

            await interfaceChannel.delete().catch(() => {});
            await category.delete().catch(() => {});

            const embed =
                new EmbedBuilder()
                    .setColor(
                        config.colors.failed
                    )
                    .setDescription(
                        `${config.emojis.failed} ${message.author}: Failed to create the **Join to Create** channel.`
                    );

            return message.channel.send({
                embeds: [embed]
            });

        }

        /*
         * Create Unmute channel
         */

        let unmute;

        try {

            unmute =
                await message.guild.channels.create({
                    name:
                        "Unmute",

                    type:
                        ChannelType.GuildVoice,

                    parent:
                        category.id,

                    reason:
                        "VoiceMaster setup"
                });

        } catch (error) {

            console.error(
                "[VOICEMASTER] Failed to create Unmute:",
                error
            );

            await joinToCreate.delete().catch(() => {});
            await interfaceChannel.delete().catch(() => {});
            await category.delete().catch(() => {});

            const embed =
                new EmbedBuilder()
                    .setColor(
                        config.colors.failed
                    )
                    .setDescription(
                        `${config.emojis.failed} ${message.author}: Failed to create the **Unmute** channel.`
                    );

            return message.channel.send({
                embeds: [embed]
            });

        }

        /*
         * Create Unmute 2 channel
         */

        let unmute2;

        try {

            unmute2 =
                await message.guild.channels.create({
                    name:
                        "Unmute 2",

                    type:
                        ChannelType.GuildVoice,

                    parent:
                        category.id,

                    reason:
                        "VoiceMaster setup"
                });

        } catch (error) {

            console.error(
                "[VOICEMASTER] Failed to create Unmute 2:",
                error
            );

            await unmute.delete().catch(() => {});
            await joinToCreate.delete().catch(() => {});
            await interfaceChannel.delete().catch(() => {});
            await category.delete().catch(() => {});

            const embed =
                new EmbedBuilder()
                    .setColor(
                        config.colors.failed
                    )
                    .setDescription(
                        `${config.emojis.failed} ${message.author}: Failed to create the **Unmute 2** channel.`
                    );

            return message.channel.send({
                embeds: [embed]
            });

        }

        /*
         * Create Random channel
         */

        let random;

        try {

            random =
                await message.guild.channels.create({
                    name:
                        "Join Random VC",

                    type:
                        ChannelType.GuildVoice,

                    parent:
                        category.id,

                    reason:
                        "VoiceMaster setup"
                });

        } catch (error) {

            console.error(
                "[VOICEMASTER] Failed to create random channel:",
                error
            );

            await unmute2.delete().catch(() => {});
            await unmute.delete().catch(() => {});
            await joinToCreate.delete().catch(() => {});
            await interfaceChannel.delete().catch(() => {});
            await category.delete().catch(() => {});

            const embed =
                new EmbedBuilder()
                    .setColor(
                        config.colors.failed
                    )
                    .setDescription(
                        `${config.emojis.failed} ${message.author}: Failed to create the **random voice channel**.`
                    );

            return message.channel.send({
                embeds: [embed]
            });

        }

        /*
         * Save VoiceMaster configuration
         */

        try {

            await VoiceMaster.create({

                guildId:
                    message.guild.id,

                defaultCategoryId:
                    category.id,

                joinToCreateId:
                    joinToCreate.id,

                unmuteId:
                    unmute.id,

                unmute2Id:
                    unmute2.id,

                randomId:
                    random.id,

                publicCategoryId:
                    null,

                privateCategoryId:
                    null,

                interfaceChannelId:
                    interfaceChannel.id,

                interfaceMessageId:
                    null

            });

        } catch (error) {

            console.error(
                "[VOICEMASTER] Failed to save configuration:",
                error
            );

            await random.delete().catch(() => {});
            await unmute2.delete().catch(() => {});
            await unmute.delete().catch(() => {});
            await joinToCreate.delete().catch(() => {});
            await interfaceChannel.delete().catch(() => {});
            await category.delete().catch(() => {});

            const embed =
                new EmbedBuilder()
                    .setColor(
                        config.colors.failed
                    )
                    .setDescription(
                        `${config.emojis.failed} ${message.author}: Failed to save the VoiceMaster **configuration**.`
                    );

            return message.channel.send({
                embeds: [embed]
            });

        }

        /*
         * Update VoiceMaster interface
         */

        try {

            await Interface.update(
                client,
                message.guild
            );

        } catch (error) {

            console.error(
                "[VOICEMASTER] Failed to update interface:",
                error
            );

        }

        /*
         * Success
         */

        const embed =
            new EmbedBuilder()
                .setColor(
                    config.colors.success
                )
                .setDescription(
                    `${config.emojis.success} ${message.author}: VoiceMaster has been **set up**.`
                );

        return message.channel.send({
            embeds: [embed]
        });

    }

};
