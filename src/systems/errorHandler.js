const path = require("path");

function getLocation(error) {

    const stack =
        error?.stack ||
        "";

    const lines =
        stack.split("\n");

    for (const line of lines) {

        const match =
            line.match(
                /\(?(.+?):(\d+):(\d+)\)?$/
            );

        if (!match) {
            continue;
        }

        const file =
            match[1];

        const lineNumber =
            match[2];

        const column =
            match[3];

        return {
            file,
            line: lineNumber,
            column
        };

    }

    return {
        file: "Unknown",
        line: "Unknown",
        column: "Unknown"
    };

}

function getRelativeFile(file) {

    if (!file || file === "Unknown") {
        return "Unknown";
    }

    const root =
        process.cwd();

    const absolute =
        path.isAbsolute(file)
            ? file
            : path.resolve(file);

    return path.relative(
        root,
        absolute
    );

}

function getErrorDetails(error) {

    const location =
        getLocation(error);

    const discordCode =
        error?.code ??
        error?.rawError?.code ??
        "Unknown";

    const discordMessage =
        error?.rawError?.message ??
        error?.message ??
        "Unknown error";

    const fieldErrors =
        error?.rawError?.errors;

    return {
        message: discordMessage,

        name:
            error?.name ||
            error?.constructor?.name ||
            "Error",

        code: discordCode,

        status:
            error?.status ??
            error?.rawError?.status ??
            "Unknown",

        file:
            getRelativeFile(
                location.file
            ),

        line:
            location.line,

        column:
            location.column,

        fields:
            fieldErrors
                ? JSON.stringify(
                    fieldErrors,
                    null,
                    2
                )
                : null,

        stack:
            error?.stack ||
            "No stack trace available."
    };

}

function report(error, context = {}) {

    const details =
        getErrorDetails(error);

    console.error(
        "\n=================================================="
    );

    console.error(
        "                    ERROR DETECTED"
    );

    console.error(
        "=================================================="
    );

    console.error(
        "Type:",
        context.type ||
        "Unknown"
    );

    console.error(
        "Name:",
        context.name ||
        "Unknown"
    );

    console.error(
        "Function:",
        context.function ||
        "Unknown"
    );

    console.error(
        "File:",
        details.file
    );

    console.error(
        "Line:",
        details.line
    );

    console.error(
        "Column:",
        details.column
    );

    console.error(
        "Error Type:",
        details.name
    );

    console.error(
        "Error Code:",
        details.code
    );

    console.error(
        "Status:",
        details.status
    );

    console.error(
        "Message:",
        details.message
    );

    if (context.customId) {

        console.error(
            "Custom ID:",
            context.customId
        );

    }

    if (context.command) {

        console.error(
            "Command:",
            context.command
        );

    }

    if (details.fields) {

        console.error(
            "Discord Fields:"
        );

        console.error(
            details.fields
        );

    }

    console.error(
        "\nStack:"
    );

    console.error(
        details.stack
    );

    console.error(
        "==================================================\n"
    );

    return details;

}

function wrap(handler, context = {}) {

    if (typeof handler !== "function") {
        return handler;
    }

    return async function errorWrappedHandler(
        ...args
    ) {

        try {

            return await handler(
                ...args
            );

        } catch (error) {

            const interaction =
                args.find(
                    arg =>
                        arg &&
                        typeof arg === "object" &&
                        (
                            arg.customId ||
                            arg.commandName ||
                            arg.isButton ||
                            arg.isModalSubmit
                        )
                );

            report(
                error,
                {
                    ...context,

                    customId:
                        context.customId ||
                        interaction?.customId,

                    command:
                        context.command ||
                        interaction?.commandName,

                    function:
                        context.function ||
                        handler.name ||
                        "anonymous"
                }
            );

            throw error;

        }

    };

}

function installGlobalHandlers() {

    process.on(
        "uncaughtException",
        error => {

            report(
                error,
                {
                    type: "PROCESS",
                    name: "uncaughtException",
                    function:
                        "process"
                }
            );

        }
    );

    process.on(
        "unhandledRejection",
        error => {

            report(
                error instanceof Error
                    ? error
                    : new Error(
                        String(error)
                    ),
                {
                    type: "PROCESS",
                    name: "unhandledRejection",
                    function:
                        "process"
                }
            );

        }
    );

}

module.exports = {

    report,

    wrap,

    installGlobalHandlers

};
