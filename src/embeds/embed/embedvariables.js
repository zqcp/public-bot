// =====================================================
// CUSTOMBOT EMBED VARIABLES
// =====================================================

function getValue(object, path) {
    if (!object || !path) {
        return "";
    }

    return path
        .split(".")
        .reduce((value, key) => value?.[key], object);
}


// =====================================================
// FORMAT NUMBER
// =====================================================

function number(value) {
    if (value === undefined || value === null) {
        return "0";
    }

    return Number(value).toLocaleString();
}


// =====================================================
// USER AVATAR
// =====================================================

function getUserAvatar(user) {
    if (!user) {
        return "";
    }

    if (typeof user.displayAvatarURL === "function") {
        try {
            return user.displayAvatarURL({
                dynamic: true,
                size: 1024
            });
        } catch {}
    }

    if (typeof user.avatarURL === "function") {
        try {
            return user.avatarURL({
                dynamic: true,
                size: 1024
            });
        } catch {}
    }

    return user.avatarURL || "";
}


// =====================================================
// SERVER ICON
// =====================================================

function getServerIcon(server) {
    if (!server) {
        return "";
    }

    if (typeof server.iconURL === "function") {
        try {
            return server.iconURL({
                dynamic: true,
                size: 1024
            });
        } catch {}
    }

    return server.iconURL || "";
}


// =====================================================
// SERVER BANNER
// =====================================================

function getServerBanner(server) {
    if (!server) {
        return "";
    }

    if (typeof server.bannerURL === "function") {
        try {
            return server.bannerURL({
                dynamic: true,
                size: 1024
            });
        } catch {}
    }

    return server.bannerURL || "";
}


// =====================================================
// SERVER SPLASH
// =====================================================

function getServerSplash(server) {
    if (!server) {
        return "";
    }

    if (typeof server.splashURL === "function") {
        try {
            return server.splashURL({
                dynamic: true,
                size: 1024
            });
        } catch {}
    }

    return server.splashURL || "";
}


// =====================================================
// USER VARIABLES
// =====================================================

function getUserVariables(user) {
    return {

        "user.id":
            user?.id || "",

        "user.name":
            user?.username ||
            user?.globalName ||
            user?.name ||
            "",

        "user.username":
            user?.username || "",

        "user.globalname":
            user?.globalName || "",

        "user.displayname":
            user?.displayName ||
            user?.globalName ||
            user?.username ||
            "",

        "user.tag":
            user?.tag || "",

        "user.mention":
            user?.id
                ? `<@${user.id}>`
                : "",

        "user.avatar":
            getUserAvatar(user),

        "user.bot":
            user?.bot
                ? "true"
                : "false",

        "user.created":
            user?.createdAt
                ? user.createdAt.toISOString()
                : "",

        "user.createdTimestamp":
            user?.createdTimestamp
                ? String(user.createdTimestamp)
                : ""
    };
}


// =====================================================
// SERVER VARIABLES
// =====================================================

function getServerVariables(server) {

    const premiumTier =
        server?.premiumTier || "NONE";

    const boostCount =
        server?.premiumSubscriptionCount || 0;

    return {

        // Basic
        "server.id":
            server?.id || "",

        "server.name":
            server?.name || "",

        "server.mention":
            server?.id
                ? `**${server.name || "Server"}**`
                : "",

        "server.icon":
            getServerIcon(server),

        "server.banner":
            getServerBanner(server),

        "server.splash":
            getServerSplash(server),

        "server.description":
            server?.description || "",

        // Owner
        "server.owner":
            server?.ownerId
                ? `<@${server.ownerId}>`
                : "",

        "server.ownerId":
            server?.ownerId || "",

        // Members
        "server.memberCount":
            number(server?.memberCount),

        "server.members":
            number(server?.memberCount),

        // Boosts
        "server.boostCount":
            number(boostCount),

        "server.boosts":
            number(boostCount),

        "server.boostLevel":
            String(premiumTier),

        "server.premiumTier":
            String(premiumTier),

        "server.premiumSubscriptionCount":
            number(boostCount),

        // Verification
        "server.verificationLevel":
            server?.verificationLevel !== undefined
                ? String(server.verificationLevel)
                : "",

        // Channels
        "server.channelCount":
            server?.channels?.cache
                ? number(server.channels.cache.size)
                : "",

        "server.roleCount":
            server?.roles?.cache
                ? number(server.roles.cache.size)
                : "",

        // Created
        "server.created":
            server?.createdAt
                ? server.createdAt.toISOString()
                : "",

        "server.createdTimestamp":
            server?.createdTimestamp
                ? String(server.createdTimestamp)
                : ""
    };
}


// =====================================================
// CHANNEL VARIABLES
// =====================================================

function getChannelVariables(channel) {
    return {

        "channel.id":
            channel?.id || "",

        "channel.name":
            channel?.name || "",

        "channel.mention":
            channel?.id
                ? `<#${channel.id}>`
                : "",

        "channel.topic":
            channel?.topic || "",

        "channel.type":
            channel?.type !== undefined
                ? String(channel.type)
                : "",

        "channel.created":
            channel?.createdAt
                ? channel.createdAt.toISOString()
                : "",

        "channel.createdTimestamp":
            channel?.createdTimestamp
                ? String(channel.createdTimestamp)
                : ""
    };
}


// =====================================================
// GENERAL VARIABLES
// =====================================================

function getGeneralVariables(context = {}) {

    return {

        "guild.id":
            context.server?.id ||
            context.guild?.id ||
            "",

        "guild.name":
            context.server?.name ||
            context.guild?.name ||
            "",

        "guild.icon":
            getServerIcon(
                context.server ||
                context.guild
            ),

        "guild.memberCount":
            number(
                context.server?.memberCount ||
                context.guild?.memberCount
            ),

        "guild.boosts":
            number(
                context.server?.premiumSubscriptionCount ||
                context.guild?.premiumSubscriptionCount ||
                0
            ),

        "guild.boostLevel":
            String(
                context.server?.premiumTier ||
                context.guild?.premiumTier ||
                "NONE"
            )
    };
}


// =====================================================
// CREATE ALL VARIABLES
// =====================================================

function createVariables(context = {}) {

    const user =
        context.user || null;

    const server =
        context.server ||
        context.guild ||
        null;

    const channel =
        context.channel || null;

    return {
        ...getUserVariables(user),
        ...getServerVariables(server),
        ...getChannelVariables(channel),
        ...getGeneralVariables(context)
    };
}


// =====================================================
// RESOLVE STRING
// =====================================================

function resolveVariables(value, context = {}) {

    if (typeof value !== "string") {
        return value;
    }

    const variables =
        createVariables(context);

    return value.replace(
        /\{([^{}]+)\}/g,
        (match, variable) => {

            const key =
                String(variable)
                    .trim()
                    .toLowerCase();

            if (
                Object.prototype.hasOwnProperty.call(
                    variables,
                    key
                )
            ) {
                return variables[key];
            }

            // Unknown variables remain untouched.
            return match;
        }
    );
}


// =====================================================
// RESOLVE OBJECT
// =====================================================

function resolveObject(object, context = {}) {

    if (typeof object === "string") {
        return resolveVariables(
            object,
            context
        );
    }

    if (Array.isArray(object)) {
        return object.map(item =>
            resolveObject(
                item,
                context
            )
        );
    }

    if (
        object &&
        typeof object === "object"
    ) {
        const result = {};

        for (const [key, value] of Object.entries(object)) {
            result[key] =
                resolveObject(
                    value,
                    context
                );
        }

        return result;
    }

    return object;
}


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    createVariables,
    resolveVariables,
    resolveObject,
    getUserVariables,
    getServerVariables,
    getChannelVariables,
    getGeneralVariables
};
