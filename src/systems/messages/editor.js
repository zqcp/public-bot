const storage = require("./storage");
const registry = require("./registry");
const renderer = require("./renderer");
const Embed = require("../../models/Embed");

function clone(value) {

    if (value === undefined) {
        return undefined;
    }

    return JSON.parse(
        JSON.stringify(value)
    );

}

function merge(target, changes) {

    if (
        !changes ||
        typeof changes !== "object" ||
        Array.isArray(changes)
    ) {
        return changes;
    }

    if (
        !target ||
        typeof target !== "object" ||
        Array.isArray(target)
    ) {
        target = {};
    }

    for (const [key, value] of Object.entries(changes)) {

        if (
            value &&
            typeof value === "object" &&
            !Array.isArray(value)
        ) {

            target[key] = merge(
                target[key],
                value
            );

            continue;

        }

        // undefined means "do not change"
        if (value === undefined) {
            continue;
        }

        target[key] = value;

    }

    return target;

}

module.exports = {

    async load(guildId, name) {

        const embed =
            await Embed.findOne({
                guildId,
                name
            });

        return embed
            ? embed.toObject()
            : null;

    },

    async update(
        guildId,
        name,
        changes = {}
    ) {

        const embed =
            await Embed.findOne({
                guildId,
                name
            });

        if (!embed) {
            return null;
        }

        /*
         * Make sure the saved embed always has
         * at least one blank embed available
         * for the editor to modify.
         */

        if (!Array.isArray(embed.embeds)) {
            embed.embeds = [];
        }

        if (!embed.embeds.length) {
            embed.embeds.push({});
        }

        const current =
            embed.toObject();

        const updated = merge(
            clone(current),
            clone(changes)
        );

        /*
         * Make sure the updated document also
         * keeps a valid blank embed.
         */

        if (!Array.isArray(updated.embeds)) {
            updated.embeds = [];
        }

        if (!updated.embeds.length) {
            updated.embeds.push({});
        }

        delete updated._id;
        delete updated.__v;

        await Embed.findOneAndUpdate(
            {
                guildId,
                name
            },
            {
                $set: updated
            },
            {
                new: true
            }
        );

        return updated;

    },

    async remove(
        guildId,
        name,
        property
    ) {

        const embed =
            await Embed.findOne({
                guildId,
                name
            });

        if (!embed) {
            return null;
        }

        const updated =
            embed.toObject();

        if (
            property &&
            Object.prototype.hasOwnProperty.call(
                updated,
                property
            )
        ) {

            delete updated[property];

        }

        delete updated._id;
        delete updated.__v;

        await Embed.findOneAndUpdate(
            {
                guildId,
                name
            },
            {
                $set: updated
            },
            {
                new: true
            }
        );

        return updated;

    },

    async updateMessage(
        client,
        guildId,
        name
    ) {

        const embed =
            await Embed.findOne({
                guildId,
                name
            });

        if (!embed) {
            return null;
        }

        const saved =
            embed.toObject();

        /*
         * Keep the saved document compatible
         * with the editor even if it was created
         * before the blank embed was added.
         */

        if (!Array.isArray(saved.embeds)) {
            saved.embeds = [];
        }

        if (!saved.embeds.length) {
            saved.embeds.push({});
        }

        const references =
            await registry.get(
                guildId,
                name
            );

        if (!references.length) {
            return saved;
        }

        const payload =
            renderer.render(saved);

        for (const reference of references) {

            try {

                const channel =
                    await client.channels.fetch(
                        reference.channelId
                    );

                if (!channel) {
                    continue;
                }

                const message =
                    await channel.messages.fetch(
                        reference.messageId
                    );

                if (!message) {
                    continue;
                }

                await message.edit(
                    payload
                );

            } catch (error) {

                console.error(
                    `[MESSAGE EDIT] Failed to update ${name}:`,
                    error
                );

            }

        }

        return saved;

    },

    async updateAndRender(
        client,
        guildId,
        name,
        changes = {}
    ) {

        const updated =
            await this.update(
                guildId,
                name,
                changes
            );

        if (!updated) {
            return null;
        }

        await this.updateMessage(
            client,
            guildId,
            name
        );

        return updated;

    }

};
