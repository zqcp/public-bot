// src/embeds/jail.js

const {
    EmbedBuilder
} = require("discord.js");

const config =
    require("../config");

module.exports = {

    jailed(
        user,
        member,
        reason
    ) {

        return new EmbedBuilder()
            .setColor(
                config.colors.success
            )
            .setDescription(
                `${config.emojis.success} ${user}: Jailed ${member} for **${reason || "No reason provided"}**.`
            );

    },


    unjailed(
        user,
        member
    ) {

        return new EmbedBuilder()
            .setColor(
                config.colors.success
            )
            .setDescription(
                `${config.emojis.success} ${user}: Unjailed ${member}.`
            );

    },


    alreadyJailed(
        user,
        member
    ) {

        return new EmbedBuilder()
            .setColor(
                config.colors.error
            )
            .setDescription(
                `${config.emojis.error} ${user}: ${member} is already jailed.`
            );

    },


    notJailed(
        user,
        member
    ) {

        return new EmbedBuilder()
            .setColor(
                config.colors.error
            )
            .setDescription(
                `${config.emojis.error} ${user}: ${member} isn't jailed.`
            );

    },


    hierarchy(
        user,
        member
    ) {

        return new EmbedBuilder()
            .setColor(
                config.colors.error
            )
            .setDescription(
                `${config.emojis.error} ${user}: You can't jail ${member} because their highest role is above or equal to yours.`
            );

    },


    botHierarchy(
        user,
        member
    ) {

        return new EmbedBuilder()
            .setColor(
                config.colors.error
            )
            .setDescription(
                `${config.emojis.error} ${user}: I can't jail ${member} because their highest role is above or equal to my highest role.`
            );

    },


    noSetup(
        user
    ) {

        return new EmbedBuilder()
            .setColor(
                config.colors.error
            )
            .setDescription(
                `${config.emojis.error} ${user}: The **jail system** hasn't been set up.`
            );

    },


    alreadySetup(
        user
    ) {

        return new EmbedBuilder()
            .setColor(
                config.colors.error
            )
            .setDescription(
                `${config.emojis.error} ${user}: The **jail system** is already set up.`
            );

    },


    setup(
        user
    ) {

        return new EmbedBuilder()
            .setColor(
                config.colors.success
            )
            .setDescription(
                `${config.emojis.success} ${user}: The **jail system** has been set up.`
            );

    },


    unsetup(
        user
    ) {

        return new EmbedBuilder()
            .setColor(
                config.colors.success
            )
            .setDescription(
                `${config.emojis.success} ${user}: The **jail system** has been removed.`
            );

    },


    unsetupBlocked(
        user,
        count
    ) {

        return new EmbedBuilder()
            .setColor(
                config.colors.error
            )
            .setDescription(
                `${config.emojis.error} ${user}: You can't remove the **jail system** while **${count}** member${count === 1 ? "" : "s"} ${count === 1 ? "is" : "are"} still jailed.`
            );

    }

};
