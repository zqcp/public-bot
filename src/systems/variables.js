module.exports = {

    /**
     * Replace all global variables in a string.
     *
     * Usage:
     * variables.replace("Welcome {user} to {server}!", member)
     */

    replace(value, member, extra = {}) {

        if (
            typeof value !== "string" ||
            !member?.guild
        ) {
            return value;
        }

        const guild =
            member.guild;

        const user =
            member.user;

        const bot =
            guild.client.user;

        const variables = {

            /*
             * USER
             */

            "{user}":
                `<@${user.id}>`,

            "{user.id}":
                user.id,

            "{user.username}":
                user.username,

            "{username}":
                user.username,

            "{user.displayname}":
                member.displayName,

            "{displayname}":
                member.displayName,

            "{user.globalname}":
                user.globalName ||
                user.username,

            "{user.tag}":
                user.tag,

            "{user.avatar}":
                user.displayAvatarURL({
                    extension: "png",
                    size: 1024
                }),

            "{user.avatar.dynamic}":
                user.displayAvatarURL({
                    dynamic: true,
                    size: 1024
                }),

            "{user.created}":
                `<t:${Math.floor(
                    user.createdTimestamp / 1000
                )}:F>`,

            "{user.created.short}":
                `<t:${Math.floor(
                    user.createdTimestamp / 1000
                )}:R>`,

            /*
             * SERVER
             */

            "{server}":
                guild.name,

            "{server.name}":
                guild.name,

            "{server.id}":
                guild.id,

            "{server.icon}":
                guild.iconURL({
                    extension: "png",
                    size: 1024
                }) || "",

            "{server.icon.dynamic}":
                guild.iconURL({
                    dynamic: true,
                    size: 1024
                }) || "",

            "{server.banner}":
                guild.bannerURL({
                    extension: "png",
                    size: 1024
                }) || "",

            "{server.splash}":
                guild.splashURL({
                    extension: "png",
                    size: 1024
                }) || "",

            "{server.owner}":
                `<@${guild.ownerId}>`,

            "{server.owner.id}":
                guild.ownerId,

            "{server.created}":
                `<t:${Math.floor(
                    guild.createdTimestamp / 1000
                )}:F>`,

            "{server.created.short}":
                `<t:${Math.floor(
                    guild.createdTimestamp / 1000
                )}:R>`,

            "{server.membercount}":
                String(
                    guild.memberCount
                ),

            "{membercount}":
                String(
                    guild.memberCount
                ),

            /*
             * MEMBER
             */

            "{member.id}":
                user.id,

            "{member.joined}":
                member.joinedTimestamp
                    ? `<t:${Math.floor(
                        member.joinedTimestamp / 1000
                    )}:F>`
                    : "",

            "{member.joined.short}":
                member.joinedTimestamp
                    ? `<t:${Math.floor(
                        member.joinedTimestamp / 1000
                    )}:R>`
                    : "",

            /*
             * MEMBER ROLES
             */

            "{member.roles}":
                member.roles.cache
                    .filter(role =>
                        role.id !== guild.id
                    )
                    .map(role =>
                        `<@&${role.id}>`
                    )
                    .join(", "),

            "{member.roles.names}":
                member.roles.cache
                    .filter(role =>
                        role.id !== guild.id
                    )
                    .map(role =>
                        role.name
                    )
                    .join(", "),

            /*
             * BOOSTER
             */

            "{user.booster}":
                member.premiumSince
                    ? "Yes"
                    : "No",

            "{user.booster.id}":
                member.premiumSince
                    ? user.id
                    : "",

            "{user.booster.name}":
                member.premiumSince
                    ? member.displayName
                    : "",

            "{user.booster.date}":
                member.premiumSinceTimestamp
                    ? `<t:${Math.floor(
                        member.premiumSinceTimestamp / 1000
                    )}:F>`
                    : "",

            "{user.booster.relative}":
                member.premiumSinceTimestamp
                    ? `<t:${Math.floor(
                        member.premiumSinceTimestamp / 1000
                    )}:R>`
                    : "",

            "{server.boostlevel}":
                String(
                    guild.premiumTier || 0
                ),

            "{server.boostcount}":
                String(
                    guild.premiumSubscriptionCount || 0
                ),

            "{server.boosters}":
                String(
                    guild.members.cache.filter(
                        member =>
                            member.premiumSince
                    ).size
                ),

            /*
             * CHANNEL
             */

            "{channel.id}":
                extra.channelId || "",

            "{channel}":
                extra.channelId
                    ? `<#${extra.channelId}>`
                    : "",

            /*
             * BOT
             */

            "{bot}":
                bot?.username || "",

            "{bot.id}":
                bot?.id || "",

            "{bot.avatar}":
                bot?.displayAvatarURL({
                    extension: "png",
                    size: 1024
                }) || "",

            /*
             * COUNTS
             */

            "{server.users}":
                String(
                    guild.members.cache.filter(
                        member =>
                            !member.user.bot
                    ).size
                ),

            "{server.bots}":
                String(
                    guild.members.cache.filter(
                        member =>
                            member.user.bot
                    ).size
                ),

            /*
             * CUSTOM VARIABLES
             *
             * Allows individual systems to
             * provide additional variables.
             */

            ...extra.variables

        };

        let result =
            value;

        for (
            const [variable, replacement]
            of Object.entries(variables)
        ) {

            result =
                result.replaceAll(
                    variable,
                    replacement ?? ""
                );

        }

        return result;

    }

};
