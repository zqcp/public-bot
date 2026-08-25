const fs = require("fs");
const path = require("path");

const slashCommands = new Map();
const buttons = new Map();
const selectMenus = new Map();
const modals = new Map();

function normalize(value) {
    return String(value || "")
        .trim()
        .toLowerCase();
}

function registerInteraction(
    type,
    name,
    handler,
    filePath = "unknown"
) {

    if (!name || typeof handler !== "function") {
        console.warn(
            `[INTERACTION CHECK] Invalid handler | Type: ${type} | Name: ${name || "MISSING"} | File: ${filePath}`
        );
        return;
    }

    const key = normalize(name);

    handler.__interactionFile =
        filePath;

    handler.__interactionName =
        name;

    handler.__interactionType =
        type;

    if (type === "command") {
        slashCommands.set(key, handler);
    }

    if (type === "button") {
        buttons.set(key, handler);
    }

    if (type === "select") {
        selectMenus.set(key, handler);
    }

    if (type === "modal") {
        modals.set(key, handler);
    }
}

function loadInteractions(client) {

    const interactionsPath = path.join(
        __dirname,
        "../interactions"
    );

    if (!fs.existsSync(interactionsPath)) {

        console.error(
            `[INTERACTION CHECK] Interactions folder not found: ${interactionsPath}`
        );

        return;
    }

    function loadFolder(folder) {

        for (const file of fs.readdirSync(folder)) {

            const filePath = path.join(
                folder,
                file
            );

            let stat;

            try {

                stat =
                    fs.statSync(
                        filePath
                    );

            } catch (error) {

                console.error(
                    `[INTERACTION CHECK] Failed to read: ${filePath}`
                );

                console.error(
                    error
                );

                continue;
            }

            if (stat.isDirectory()) {

                loadFolder(
                    filePath
                );

                continue;
            }

            if (!file.endsWith(".js")) {
                continue;
            }

            let interaction;

            try {

                interaction =
                    require(filePath);

            } catch (error) {

                console.error(
                    `\n========== INTERACTION LOAD ERROR ==========`
                );

                console.error(
                    "File:",
                    filePath
                );

                console.error(
                    "Error:",
                    error
                );

                console.error(
                    "============================================\n"
                );

                continue;
            }

            if (!interaction.name) {

                console.error(
                    `[INTERACTION CHECK] Missing name | File: ${filePath}`
                );

                continue;
            }

            if (!interaction.type) {

                console.error(
                    `[INTERACTION CHECK] Missing type | Name: ${interaction.name} | File: ${filePath}`
                );

                continue;
            }

            if (
                typeof interaction.execute !==
                "function"
            ) {

                console.error(
                    `[INTERACTION CHECK] Missing execute() | ${interaction.type} | ${interaction.name} | File: ${filePath}`
                );

                continue;
            }

            registerInteraction(
                interaction.type,
                interaction.name,
                interaction.execute,
                filePath
            );

            console.log(
                `[INTERACTION] Loaded ${interaction.type.toUpperCase()} | ${interaction.name} | ${filePath}`
            );
        }
    }

    loadFolder(
        interactionsPath
    );

    client.interactions = {
        commands: slashCommands,
        buttons,
        selectMenus,
        modals
    };

    /*
     * Interaction system summary
     */

    console.log(
        "\n========== INTERACTION REGISTRY =========="
    );

    console.log(
        `Commands: ${slashCommands.size}`
    );

    console.log(
        `Buttons: ${buttons.size}`
    );

    console.log(
        `Select Menus: ${selectMenus.size}`
    );

    console.log(
        `Modals: ${modals.size}`
    );

    console.log(
        "==========================================\n"
    );

    return client.interactions;
}

function findHandler(
    collection,
    customId
) {

    const id =
        normalize(customId);

    /*
     * Exact match
     */

    if (collection.has(id)) {
        return collection.get(id);
    }

    /*
     * Prefix match
     *
     * Example:
     *
     * Registered:
     * embedButtonSelect
     *
     * Actual:
     * embedButtonSelect:colors
     */

    for (
        const [
            key,
            handler
        ] of collection
    ) {

        if (
            id === key ||
            id.startsWith(
                `${key}:`
            )
        ) {

            return handler;
        }
    }

    return null;
}

function printRegisteredHandlers(
    collection,
    collectionName
) {

    console.error(
        `\n========== REGISTERED ${collectionName.toUpperCase()} ==========`
    );

    if (!collection.size) {

        console.error(
            "NONE"
        );

    } else {

        for (
            const [
                key,
                handler
            ] of collection
        ) {

            console.error(
                `${key} | ${handler.__interactionFile || "unknown"}`
            );
        }
    }

    console.error(
        "================================================\n"
    );
}

async function executeHandler(
    handler,
    interaction
) {

    try {

        await handler(
            interaction.client,
            interaction
        );

        return true;

    } catch (error) {

        console.error(
            "\n========== INTERACTION ERROR =========="
        );

        console.error(
            "Type:",
            interaction.type
        );

        console.error(
            "User:",
            interaction.user?.tag
        );

        console.error(
            "Guild:",
            interaction.guild?.id
        );

        console.error(
            "Custom ID:",
            interaction.customId
        );

        console.error(
            "Handler:",
            handler?.name
        );

        console.error(
            "Handler File:",
            handler?.__interactionFile ||
            "unknown"
        );

        console.error(
            "Error:",
            error
        );

        console.error(
            "Message:",
            error?.message
        );

        console.error(
            "Stack:",
            error?.stack
        );

        console.error(
            "=======================================\n"
        );

        try {

            const payload = {
                content:
                    `❌ **Interaction Error**\n` +
                    `\`${error?.message || "Unknown error"}\``,
                flags: 64
            };

            if (
                interaction.replied ||
                interaction.deferred
            ) {

                await interaction.followUp(
                    payload
                );

            } else {

                await interaction.reply(
                    payload
                );
            }

        } catch (replyError) {

            console.error(
                "[INTERACTIONS] Error sending error message:",
                replyError
            );
        }

        return false;
    }
}

async function handleInteraction(
    interaction
) {

    if (interaction.isButton()) {

        const handler =
            findHandler(
                buttons,
                interaction.customId
            );

        console.log(
            `[INTERACTION] BUTTON | ${interaction.customId} | Handler: ${handler?.name || "NOT FOUND"}`
        );

        if (!handler) {

            console.error(
                `\n========== BUTTON HANDLER NOT FOUND ==========`
            );

            console.error(
                "Custom ID:",
                interaction.customId
            );

            console.error(
                "Normalized:",
                normalize(
                    interaction.customId
                )
            );

            printRegisteredHandlers(
                buttons,
                "BUTTONS"
            );

            console.error(
                "==============================================\n"
            );

            return;
        }

        await executeHandler(
            handler,
            interaction
        );

        return;
    }

    if (
        interaction.isStringSelectMenu() ||
        interaction.isUserSelectMenu() ||
        interaction.isRoleSelectMenu() ||
        interaction.isChannelSelectMenu() ||
        interaction.isMentionableSelectMenu()
    ) {

        const handler =
            findHandler(
                selectMenus,
                interaction.customId
            );

        console.log(
            `[INTERACTION] SELECT | ${interaction.customId} | Handler: ${handler?.name || "NOT FOUND"}`
        );

        if (!handler) {

            console.error(
                `\n========== SELECT HANDLER NOT FOUND ==========`
            );

            console.error(
                "Custom ID:",
                interaction.customId
            );

            console.error(
                "Normalized:",
                normalize(
                    interaction.customId
                )
            );

            console.error(
                "Select Type:",
                interaction.isStringSelectMenu()
                    ? "String"
                    : interaction.isRoleSelectMenu()
                        ? "Role"
                        : interaction.isUserSelectMenu()
                            ? "User"
                            : interaction.isChannelSelectMenu()
                                ? "Channel"
                                : interaction.isMentionableSelectMenu()
                                    ? "Mentionable"
                                    : "Unknown"
            );

            console.error(
                "Selected Values:",
                interaction.values || []
            );

            printRegisteredHandlers(
                selectMenus,
                "SELECT MENUS"
            );

            console.error(
                "==============================================\n"
            );

            return;
        }

        await executeHandler(
            handler,
            interaction
        );

        return;
    }

    if (
        interaction.isModalSubmit()
    ) {

        const handler =
            findHandler(
                modals,
                interaction.customId
            );

        console.log(
            "\n========== MODAL SUBMIT =========="
        );

        console.log(
            "Custom ID:",
            interaction.customId
        );

        console.log(
            "Handler:",
            handler?.name ||
            "NOT FOUND"
        );

        console.log(
            "Handler File:",
            handler?.__interactionFile ||
            "unknown"
        );

        console.log(
            "Guild:",
            interaction.guild?.id
        );

        console.log(
            "User:",
            interaction.user?.tag
        );

        console.log(
            "Fields:",
            interaction.fields?.fields
                ? [
                    ...interaction.fields.fields.keys()
                ]
                : []
        );

        console.log(
            "==================================\n"
        );

        if (!handler) {

            printRegisteredHandlers(
                modals,
                "MODALS"
            );

            return;
        }

        await executeHandler(
            handler,
            interaction
        );

        return;
    }
}

function register(client) {

    client.on(
        "interactionCreate",
        async interaction => {

            try {

                await handleInteraction(
                    interaction
                );

            } catch (error) {

                console.error(
                    "\n[INTERACTIONS] UNHANDLED ERROR"
                );

                console.error(
                    error
                );

                console.error(
                    error?.stack
                );

            }

        }
    );
}

module.exports = {
    loadInteractions,
    handleInteraction,
    registerInteraction,
    register,
    slashCommands,
    buttons,
    selectMenus,
    modals
};
