const fs = require("fs");
const path = require("path");

const commands = new Map();
const aliases = new Map();

function normalize(value) {
    return value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

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

function loadCommands(client) {
    const commandsPath = path.join(__dirname, "../commands");

    commands.clear();
    aliases.clear();

    const files = getFiles(commandsPath);

    for (const file of files) {
        try {
            delete require.cache[require.resolve(file)];

            const command = require(file);

            if (!command || typeof command.execute !== "function") {
                console.warn(
                    `[COMMANDS] Skipped ${path.relative(process.cwd(), file)} - missing execute()`
                );
                continue;
            }

            if (!command.name) {
                console.warn(
                    `[COMMANDS] Skipped ${path.relative(process.cwd(), file)} - missing name`
                );
                continue;
            }

            const commandName = normalize(command.name);

            if (commands.has(commandName)) {
                console.warn(
                    `[COMMANDS] Duplicate command: ${commandName}`
                );
                continue;
            }

            command.category ??= path.basename(path.dirname(file));
            command.file = file;

            commands.set(commandName, command);

            if (Array.isArray(command.aliases)) {
                for (const alias of command.aliases) {
                    if (typeof alias !== "string") {
                        continue;
                    }

                    const normalizedAlias = normalize(alias);

                    if (!normalizedAlias) {
                        continue;
                    }

                    if (commands.has(normalizedAlias)) {
                        console.warn(
                            `[COMMANDS] Alias "${alias}" conflicts with command "${normalizedAlias}"`
                        );
                        continue;
                    }

                    if (aliases.has(normalizedAlias)) {
                        console.warn(
                            `[COMMANDS] Duplicate alias: ${normalizedAlias}`
                        );
                        continue;
                    }

                    aliases.set(normalizedAlias, command);
                }
            }

            console.log(
                `[COMMANDS] Loaded ${commandName}`
            );

        } catch (error) {
            console.error(
                `[COMMANDS] Failed to load ${path.relative(process.cwd(), file)}`
            );

            console.error(error);
        }
    }

    client.commands = commands;
    client.commandAliases = aliases;

    console.log(
        `[COMMANDS] Loaded ${commands.size} commands and ${aliases.size} aliases.`
    );

    return {
        commands,
        aliases
    };
}

function findCommand(input) {
    if (!input) {
        return null;
    }

    const normalized = normalize(input);

    if (!normalized) {
        return null;
    }

    if (commands.has(normalized)) {
        return commands.get(normalized);
    }

    if (aliases.has(normalized)) {
        return aliases.get(normalized);
    }

    return null;
}

function parseCommand(content, prefix) {
    if (!content || !prefix) {
        return null;
    }

    if (!content.toLowerCase().startsWith(prefix.toLowerCase())) {
        return null;
    }

    const withoutPrefix = content
        .slice(prefix.length)
        .trim();

    if (!withoutPrefix) {
        return null;
    }

    const parts = withoutPrefix.split(/\s+/);

    /*
     * Find the longest matching command.
     *
     * Example:
     *
     * ,reaction role create
     *
     * If "reaction role" is a registered command:
     *
     * commandName = reaction role
     * args = ["create"]
     */

    for (let length = parts.length; length >= 1; length--) {
        const possibleCommand = parts
            .slice(0, length)
            .join(" ");

        const command = findCommand(possibleCommand);

        if (!command) {
            continue;
        }

        return {
            command,
            commandName: normalize(possibleCommand),
            args: parts.slice(length),
            rawArgs: parts.slice(length).join(" ")
        };
    }

    return {
        command: null,
        commandName: normalize(parts[0]),
        args: parts.slice(1),
        rawArgs: parts.slice(1).join(" ")
    };
}

async function handleMessage(message, config) {
    if (!message || !message.content) {
        return;
    }

    if (message.author?.bot) {
        return;
    }

    const parsed = parseCommand(
        message.content,
        config.prefix
    );

    if (!parsed || !parsed.command) {
        return;
    }

    const {
        command,
        args,
        rawArgs,
        commandName
    } = parsed;

    try {
        await command.execute(message, args, {
            client: message.client,
            command,
            commandName,
            rawArgs
        });

    } catch (error) {
        console.error(
            `[COMMANDS] Error executing ${commandName}:`,
            error
        );

        if (
            !message.replied &&
            !message.deferred
        ) {
            try {
                const Embed = require("../embeds/global");

                await message.channel.send({
                    embeds: [
                        Embed.error(
                            "Something went wrong while executing that command."
                        )
                    ]
                });

            } catch (sendError) {
                console.error(
                    "[COMMANDS] Failed to send error embed:",
                    sendError
                );
            }
        }
    }
}

module.exports = {
    loadCommands,
    handleMessage,
    parseCommand,
    findCommand,
    commands,
    aliases
};
