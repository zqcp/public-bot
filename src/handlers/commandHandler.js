const fs = require("fs");
const path = require("path");


// =====================================================
// COMMAND COLLECTIONS
// =====================================================

const commands = new Map();
const aliases = new Map();


// =====================================================
// NORMALIZE
// =====================================================

function normalize(value) {

    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

}


// =====================================================
// FIND COMMAND FILES
// =====================================================

function getCommandFiles(directory) {

    if (!fs.existsSync(directory)) {
        return [];
    }

    const files = [];

    for (const file of fs.readdirSync(directory)) {

        const filePath =
            path.join(directory, file);

        const stats =
            fs.statSync(filePath);

        if (stats.isDirectory()) {

            files.push(
                ...getCommandFiles(filePath)
            );

            continue;
        }

        if (
            file.endsWith(".js") &&
            file !== "index.js"
        ) {
            files.push(filePath);
        }
    }

    return files;
}


// =====================================================
// REGISTER COMMAND
// =====================================================

function registerCommand(command, filePath) {

    if (
        !command ||
        typeof command !== "object"
    ) {
        return;
    }

    if (
        !command.name ||
        typeof command.execute !== "function"
    ) {
        console.log(
            `[COMMANDS] Skipped invalid command: ${filePath}`
        );

        return;
    }

    const name =
        normalize(command.name);

    if (!name) {
        return;
    }


    // =================================================
    // COMMAND
    // =================================================

    commands.set(
        name,
        command
    );


    // =================================================
    // ALIASES
    // =================================================

    if (Array.isArray(command.aliases)) {

        for (const alias of command.aliases) {

            const normalizedAlias =
                normalize(alias);

            if (!normalizedAlias) {
                continue;
            }

            aliases.set(
                normalizedAlias,
                name
            );
        }
    }


    console.log(
        `[COMMANDS] Loaded: ${name}`
    );

}


// =====================================================
// LOAD COMMANDS
// =====================================================

function load(client) {

    const commandsPath =
        path.join(
            __dirname,
            "../commands"
        );


    if (!fs.existsSync(commandsPath)) {

        console.log(
            "[COMMANDS] Commands folder not found."
        );

        client.commands = commands;

        return commands;
    }


    const files =
        getCommandFiles(
            commandsPath
        );


    for (const filePath of files) {

        try {

            delete require.cache[
                require.resolve(filePath)
            ];

            const command =
                require(filePath);


            // =========================================
            // SUPPORT DEFAULT EXPORT
            // =========================================

            if (
                command &&
                command.default
            ) {

                registerCommand(
                    command.default,
                    filePath
                );

                continue;
            }


            // =========================================
            // NORMAL COMMAND
            // =========================================

            registerCommand(
                command,
                filePath
            );


        } catch (error) {

            console.error(
                `[COMMANDS] Failed to load ${filePath}:`,
                error
            );

        }
    }


    // =================================================
    // CLIENT COLLECTION
    // =================================================

    client.commands =
        commands;

    client.commandAliases =
        aliases;


    console.log(
        `[COMMANDS] Loaded ${commands.size} command(s).`
    );


    return commands;

}


// =====================================================
// FIND COMMAND
// =====================================================

function findCommand(input) {

    const name =
        normalize(input);

    if (!name) {
        return null;
    }


    // =================================================
    // EXACT COMMAND
    // =================================================

    if (commands.has(name)) {

        return commands.get(name);

    }


    // =================================================
    // ALIAS
    // =================================================

    const aliasTarget =
        aliases.get(name);

    if (
        aliasTarget &&
        commands.has(aliasTarget)
    ) {

        return commands.get(
            aliasTarget
        );

    }


    return null;

}


// =====================================================
// PARSE PREFIX COMMAND
// =====================================================

function parseCommand(message, prefix) {

    if (
        !message ||
        !message.content
    ) {
        return null;
    }


    const content =
        message.content.trim();


    if (!content) {
        return null;
    }


    const normalizedPrefix =
        String(prefix || ",")
            .trim();


    if (
        !content
            .toLowerCase()
            .startsWith(
                normalizedPrefix.toLowerCase()
            )
    ) {
        return null;
    }


    const withoutPrefix =
        content.slice(
            normalizedPrefix.length
        ).trim();


    if (!withoutPrefix) {
        return null;
    }


    const parts =
        withoutPrefix.split(/\s+/);


    if (!parts.length) {
        return null;
    }


    // =================================================
    // SUPPORT SPACED COMMANDS
    //
    // ,embed create
    // ,embed edit
    // ,embed delete
    //
    // =================================================

    let commandName =
        normalize(parts[0]);

    let argumentStart = 1;


    if (parts.length >= 2) {

        const twoPart =
            normalize(
                `${parts[0]} ${parts[1]}`
            );


        if (
            commands.has(twoPart) ||
            aliases.has(twoPart)
        ) {

            commandName =
                twoPart;

            argumentStart = 2;

        }

    }


    const args =
        parts.slice(
            argumentStart
        );


    return {
        name: commandName,
        args
    };

}


// =====================================================
// EXECUTE COMMAND
// =====================================================

async function execute(
    message,
    prefix
) {

    if (
        !message ||
        message.author?.bot
    ) {
        return false;
    }


    const parsed =
        parseCommand(
            message,
            prefix
        );


    if (!parsed) {
        return false;
    }


    const command =
        findCommand(
            parsed.name
        );


    if (!command) {
        return false;
    }


    try {

        await command.execute(
            message,
            parsed.args
        );


        return true;


    } catch (error) {

        console.error(
            `[COMMANDS] Error executing ${parsed.name}:`,
            error
        );


        try {

            const payload = {
                content:
                    "Something went wrong while executing this command.",
                flags: 64
            };


            if (
                message.replied ||
                message.deferred
            ) {

                await message.channel.send(
                    payload
                );

            } else {

                await message.channel.send(
                    payload
                );

            }

        } catch (replyError) {

            console.error(
                "[COMMANDS] Failed to send error:",
                replyError
            );

        }


        return false;

    }

}


// =====================================================
// REGISTER MESSAGE HANDLER
// =====================================================

function register(client) {

    client.on(
        "messageCreate",
        async message => {

            const config =
                require("../config");


            const prefix =
                config.prefix || ",";


            await execute(
                message,
                prefix
            );

        }
    );

}


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    load,

    register,

    execute,

    findCommand,

    parseCommand,

    commands,

    aliases

};
