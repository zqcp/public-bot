const storage = require("./storage");
const registry = require("./registry");
const renderer = require("./renderer");

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

        return storage.getMessage(
            guildId,
            name
        );

    },

    async update(
        guildId,
        name,
        changes = {}
    ) {

        const current =
            await storage.getMessage(
                guildId,
                name
            );

        if (!current) {
            return null;
        }

        const updated = merge(
            clone(current),
            clone(changes)
        );

        await storage.setMessage(
            guildId,
            name,
            updated
        );

        return updated;

    },

    async remove(
        guildId,
        name,
        property
    ) {

        const current =
            await storage.getMessage(
                guildId,
                name
            );

        if (!current) {
            return null;
        }

        const updated = clone(current);

        if (
            property &&
            Object.prototype.hasOwnProperty.call(
                updated,
                property
            )
        ) {

            delete updated[property];

        }

        await storage.setMessage(
            guildId,
            name,
            updated
        );

        return updated;

    },

    async updateMessage(
        client,
        guildId,
        name
    ) {

        const saved =
            await storage.getMessage(
                guildId,
                name
            );

        if (!saved) {
            return null;
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
