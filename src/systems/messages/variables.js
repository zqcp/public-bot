function getValue(object, path) {

    if (!object || !path) {
        return "";
    }

    const parts = path.split(".");

    let value = object;

    for (const part of parts) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        value = value[part];

    }

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value);

}

function resolveString(value, context = {}) {

    if (
        value === null ||
        value === undefined
    ) {
        return value;
    }

    if (typeof value !== "string") {
        return value;
    }

    return value.replace(
        /\{([^{}]+)\}/g,
        (match, variable) => {

            const key = variable.trim();

            const resolved = getValue(
                context,
                key
            );

            return resolved;

        }
    );

}

function resolve(object, context = {}) {

    if (typeof object === "string") {
        return resolveString(
            object,
            context
        );
    }

    if (Array.isArray(object)) {

        return object.map(item =>
            resolve(item, context)
        );

    }

    if (
        object &&
        typeof object === "object"
    ) {

        const result = {};

        for (const [key, value] of Object.entries(object)) {

            result[key] = resolve(
                value,
                context
            );

        }

        return result;

    }

    return object;

}

module.exports = {

    resolve,

    resolveString

};
