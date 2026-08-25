const {
    InteractionType
} = require("discord.js");

const slashCommands = new Map();
const buttons = new Map();
const selectMenus = new Map();
const modals = new Map();

/**
 * Normalize custom IDs / command names.
 */
function normalize(value) {
    return String(value || "")
        .trim()
        .toLowerCase();
}

/**
 * Register an interaction handler.
 *
 * Supported:
 * - slash commands
 * - buttons
 * - select menus
 * - modals
 * - autocomplete
 */
function registerInteraction(type, name, handler) {
    if (!name || typeof handler !== "function") {
        return;
    }

    const key = normalize(name);

    if (type === "command") {
        slashCommands.set(key, handler);
        return;
    }

    if (type === "button") {
        buttons.set(key, handler);
        return;
    }

    if (type === "select") {
        selectMenus.set(key, handler);
        return;
    }

    if (type === "modal") {
        modals.set(key, handler);
        return;
    }
}

/**
 * Load interaction files.
 *
 * Interaction files can be placed anywhere inside:
 *
 * src/commands/
 * src/systems/
 *
 * This lets us keep commands and systems together
 * without creating separate interaction handlers.
 */
function loadInteractions(client) {
    client.interactions = {
        commands: slashCommands,
        buttons,
        selectMenus,
        modals
    };

    return client.interactions;
}

/**
 * Find a handler using an exact ID first,
 * then support prefixes.
 *
 * Example:
 *
 * button ID:
 * ticket_close
 *
 * Registered:
 * ticket_close
 *
 * Or:
 *
 * ticket_
 *
 * Can handle:
 * ticket_close
 * ticket_claim
 * ticket_delete
 */
function findHandler(collection, customId) {
    const id = normalize(customId);

    if (!id) {
        return null;
    }

    // Exact match
    if (collection.has(id)) {
        return collection.get(id);
    }

    // Prefix match
    for (const [key, handler] of collection) {
        if (id.startsWith(key)) {
            return handler;
        }
    }

    return null;
}

/**
 * Run an interaction handler safely.
 */
async function executeHandler(handler, interaction) {
    if (!handler) {
        return false;
    }

    try {
        await handler(interaction);
        return true;

    } catch (error) {
        console.error(
            `[INTERACTIONS] Error handling ${interaction.type}:`,
            error
        );

        try {
            const payload = {
                content: "Something went wrong while processing this interaction.",
                flags: 64
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(payload);
            } else {
                await interaction.reply(payload);
            }

        } catch (replyError) {
            console.error(
                "[INTERACTIONS] Failed to send error response:",
                replyError
            );
        }

        return false;
    }
}

/**
 * Handle every Discord interaction.
 */
async function handleInteraction(interaction) {

    // =========================
    // SLASH COMMANDS
    // =========================

    if (interaction.isChatInputCommand()) {

        const commandName = normalize(
            interaction.commandName
        );

        const handler =
            slashCommands.get(commandName);

        if (!handler) {
            return;
        }

        await executeHandler(
            handler,
            interaction
        );

        return;
    }


    // =========================
    // AUTOCOMPLETE
    // =========================

    if (interaction.isAutocomplete()) {

        const commandName = normalize(
            interaction.commandName
        );

        const handler =
            slashCommands.get(commandName);

        if (!handler) {
            return;
        }

        if (typeof handler.autocomplete === "function") {
            try {
                await handler.autocomplete(
                    interaction
                );
            } catch (error) {
                console.error(
                    `[INTERACTIONS] Autocomplete error in ${commandName}:`,
                    error
                );
            }
        }

        return;
    }


    // =========================
    // BUTTONS
    // =========================

    if (interaction.isButton()) {

        const handler = findHandler(
            buttons,
            interaction.customId
        );

        if (!handler) {
            return;
        }

        await executeHandler(
            handler,
            interaction
        );

        return;
    }


    // =========================
    // SELECT MENUS
    // =========================

    if (
        interaction.isStringSelectMenu() ||
        interaction.isUserSelectMenu() ||
        interaction.isRoleSelectMenu() ||
        interaction.isChannelSelectMenu() ||
        interaction.isMentionableSelectMenu()
    ) {

        const handler = findHandler(
            selectMenus,
            interaction.customId
        );

        if (!handler) {
            return;
        }

        await executeHandler(
            handler,
            interaction
        );

        return;
    }


    // =========================
    // MODALS
    // =========================

    if (interaction.isModalSubmit()) {

        const handler = findHandler(
            modals,
            interaction.customId
        );

        if (!handler) {
            return;
        }

        await executeHandler(
            handler,
            interaction
        );

        return;
    }
}

/**
 * Add an event listener to Discord.
 */
function register(client) {
    client.on(
        "interactionCreate",
        async interaction => {
            await handleInteraction(
                interaction
            );
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
