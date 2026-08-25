const fs = require("fs");
const path = require("path");

function getFiles(directory) {
    if (!fs.existsSync(directory)) {
        return [];
    }

    const files = [];

    for (const entry of fs.readdirSync(directory, {
        withFileTypes: true
    })) {
        const fullPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            files.push(...getFiles(fullPath));
            continue;
        }

        if (entry.isFile() && entry.name.endsWith(".js")) {
            files.push(fullPath);
        }
    }

    return files;
}

function loadEvent(client, file, source) {
    try {
        delete require.cache[require.resolve(file)];

        const event = require(file);

        if (!event) {
            console.warn(
                `[EVENTS] Skipped ${path.relative(process.cwd(), file)} - empty export`
            );
            return false;
        }

        const eventName =
            event.name ||
            event.event;

        if (!eventName) {
            console.warn(
                `[EVENTS] Skipped ${path.relative(process.cwd(), file)} - missing name/event`
            );
            return false;
        }

        if (typeof event.execute !== "function") {
            console.warn(
                `[EVENTS] Skipped ${path.relative(process.cwd(), file)} - missing execute()`
            );
            return false;
        }

        const execute = (...args) => {
            try {
                const result = event.execute(...args);

                if (result?.catch) {
                    result.catch(error => {
                        console.error(
                            `[EVENTS] Error in ${eventName}:`,
                            error
                        );
                    });
                }

            } catch (error) {
                console.error(
                    `[EVENTS] Error in ${eventName}:`,
                    error
                );
            }
        };

        if (event.once === true) {
            client.once(eventName, execute);
        } else {
            client.on(eventName, execute);
        }

        console.log(
            `[EVENTS] Loaded ${eventName} (${source})`
        );

        return true;

    } catch (error) {
        console.error(
            `[EVENTS] Failed to load ${path.relative(process.cwd(), file)}`
        );

        console.error(error);

        return false;
    }
}

function loadEvents(client) {
    const eventsPath = path.join(
        __dirname,
        "../events"
    );

    const systemsPath = path.join(
        __dirname,
        "../systems"
    );

    let loaded = 0;

    // =========================
    // REGULAR EVENTS
    // =========================

    for (const file of getFiles(eventsPath)) {
        if (loadEvent(client, file, "event")) {
            loaded++;
        }
    }

    // =========================
    // SYSTEM EVENTS
    // =========================

    for (const file of getFiles(systemsPath)) {
        if (loadEvent(client, file, "system")) {
            loaded++;
        }
    }

    console.log(
        `[EVENTS] Loaded ${loaded} event/system listeners.`
    );

    return loaded;
}

module.exports = {
    loadEvents
};
