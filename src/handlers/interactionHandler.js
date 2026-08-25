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

function registerInteraction(type, name, handler) {

    if (!name || typeof handler !== "function") {
        return;
    }

    const key = normalize(name);

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

    if (fs.existsSync(interactionsPath)) {

        function loadFolder(folder) {

            for (const file of fs.readdirSync(folder)) {

                const filePath = path.join(
                    folder,
                    file
                );

                if (fs.statSync(filePath).isDirectory()) {
                    loadFolder(filePath);
                    continue;
                }

                if (!file.endsWith(".js")) {
                    continue;
                }

                const interaction = require(filePath);

                if (!interaction.name || !interaction.type) {
                    continue;
                }

                registerInteraction(
                    interaction.type,
                    interaction.name,
                    interaction.execute
                );

                console.log(
                    `Loaded ${interaction.type}: ${interaction.name}`
                );
            }
        }

        loadFolder(interactionsPath);
    }

    client.interactions = {
        commands: slashCommands,
        buttons,
        selectMenus,
        modals
    };

    return client.interactions;
}

function findHandler(collection, customId) {

    const id = normalize(customId);

    if (collection.has(id)) {
        return collection.get(id);
    }

    for (const [key, handler] of collection) {

        if (
            id === key ||
            id.startsWith(`${key}:`)
        ) {
            return handler;
        }

    }

    return null;
}

async function executeHandler(handler, interaction) {

    try {

        await handler(
            interaction.client,
            interaction
        );

        return true;

    } catch (error) {

        console.error("\n========== INTERACTION ERROR ==========");
        console.error("Type:", interaction.type);
        console.error("User:", interaction.user?.tag);
        console.error("Guild:", interaction.guild?.id);
        console.error("Custom ID:", interaction.customId);
        console.error("Handler:", handler?.name);
        console.error("Error:", error);
        console.error("Message:", error?.message);
        console.error("Stack:", error?.stack);
        console.error("=======================================\n");

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
                await interaction.followUp(payload);
            } else {
                await interaction.reply(payload);
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

async function handleInteraction(interaction) {

    if (interaction.isButton()) {

        const handler = findHandler(
            buttons,
            interaction.customId
        );

        console.log(
            `[INTERACTION] BUTTON | ${interaction.customId} | Handler: ${handler?.name || "NOT FOUND"}`
        );

        if (handler) {
            await executeHandler(
                handler,
                interaction
            );
        }

        return;
    }

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

        console.log(
            `[INTERACTION] SELECT | ${interaction.customId} | Handler: ${handler?.name || "NOT FOUND"}`
        );

        if (handler) {
            await executeHandler(
                handler,
                interaction
            );
        }

        return;
    }

    if (interaction.isModalSubmit()) {

        const handler = findHandler(
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
            handler?.name || "NOT FOUND"
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
                ? [...interaction.fields.fields.keys()]
                : []
        );

        console.log(
            "==================================\n"
        );

        if (handler) {
            await executeHandler(
                handler,
                interaction
            );
        }

        return;
    }
}

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
