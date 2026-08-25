const { EmbedBuilder } = require("discord.js");

const {
    createEmbed,
    resolveVariables,
    resolveObject
} = require("../../embeds/embed");

class MessageRenderer {

    // =====================================================
    // BUILD MESSAGE
    // =====================================================

    static build(configuration = {}, context = {}) {

        if (
            !configuration ||
            typeof configuration !== "object"
        ) {
            return {};
        }

        const message = {};

        // =================================================
        // MESSAGE CONTENT
        // =================================================

        if (
            configuration.content !== undefined &&
            configuration.content !== null
        ) {
            message.content =
                resolveVariables(
                    String(configuration.content),
                    context
                );
        }

        // =================================================
        // EMBEDS
        // =================================================

        if (Array.isArray(configuration.embeds)) {

            const embeds = [];

            for (const data of configuration.embeds) {

                if (!data || typeof data !== "object") {
                    continue;
                }

                try {
                    const resolved =
                        resolveObject(
                            data,
                            context
                        );

                    const embed =
                        this.buildEmbed(resolved);

                    if (embed) {
                        embeds.push(embed);
                    }

                } catch {
                    // Ignore invalid embed configurations.
                }
            }

            if (embeds.length) {
                message.embeds = embeds;
            }
        }

        // =================================================
        // COMPONENTS
        // =================================================

        if (Array.isArray(configuration.components)) {

            const components =
                this.buildComponents(
                    configuration.components,
                    context
                );

            if (components.length) {
                message.components =
                    components;
            }
        }

        // =================================================
        // ALLOWED MENTIONS
        // =================================================

        if (configuration.allowedMentions) {

            message.allowedMentions =
                configuration.allowedMentions;
        }

        // =================================================
        // FLAGS
        // =================================================

        if (configuration.flags !== undefined) {
            message.flags =
                configuration.flags;
        }

        return message;
    }


    // =====================================================
    // BUILD EMBED
    // =====================================================

    static buildEmbed(data = {}) {

        if (!data || typeof data !== "object") {
            return null;
        }

        // Already an EmbedBuilder
        if (data instanceof EmbedBuilder) {
            return data;
        }

        const builder =
            createEmbed();

        // =================================================
        // TITLE
        // =================================================

        if (data.title) {
            builder.title(data.title);
        }

        // =================================================
        // DESCRIPTION
        // =================================================

        if (data.description) {
            builder.description(
                data.description
            );
        }

        // =================================================
        // COLOR
        // =================================================

        if (data.color !== undefined) {
            builder.color(data.color);
        }

        // =================================================
        // URL
        // =================================================

        if (data.url) {
            builder.url(data.url);
        }

        // =================================================
        // AUTHOR
        // =================================================

        if (data.author) {
            builder.author(data.author);
        }

        // =================================================
        // FOOTER
        // =================================================

        if (data.footer) {
            builder.footer(data.footer);
        }

        // =================================================
        // THUMBNAIL
        // =================================================

        if (data.thumbnail) {
            builder.thumbnail(
                data.thumbnail
            );
        }

        // =================================================
        // IMAGE
        // =================================================

        if (data.image) {
            builder.image(
                data.image
            );
        }

        // =================================================
        // TIMESTAMP
        // =================================================

        if (data.timestamp) {
            builder.timestamp(
                data.timestamp === true
                    ? Date.now()
                    : data.timestamp
            );
        }

        // =================================================
        // FIELDS
        // =================================================

        if (Array.isArray(data.fields)) {
            builder.fields(
                data.fields
            );
        }

        return builder.build();
    }


    // =====================================================
    // BUILD COMPONENTS
    // =====================================================

    static buildComponents(
        components = [],
        context = {}
    ) {

        if (!Array.isArray(components)) {
            return [];
        }

        return components
            .map(row => {

                if (
                    !row ||
                    typeof row !== "object"
                ) {
                    return null;
                }

                /*
                 * Components are intentionally kept as
                 * Discord component JSON here.
                 *
                 * This allows buttons/select menus to be
                 * saved in MongoDB without storing live
                 * Discord.js classes.
                 */

                const resolved =
                    resolveObject(
                        row,
                        context
                    );

                return resolved;
            })
            .filter(Boolean);
    }


    // =====================================================
    // BUILD FROM SAVED MESSAGE
    // =====================================================

    static fromSaved(
        configuration,
        context = {}
    ) {

        return this.build(
            configuration,
            context
        );
    }


    // =====================================================
    // SEND
    // =====================================================

    static async send(
        target,
        configuration,
        context = {}
    ) {

        if (!target) {
            throw new Error(
                "A Discord target is required."
            );
        }

        const message =
            this.build(
                configuration,
                context
            );

        return target.send(message);
    }


    // =====================================================
    // REPLY
    // =====================================================

    static async reply(
        interaction,
        configuration,
        context = {}
    ) {

        if (!interaction) {
            throw new Error(
                "A Discord interaction is required."
            );
        }

        const message =
            this.build(
                configuration,
                context
            );

        return interaction.reply(message);
    }


    // =====================================================
    // EDIT
    // =====================================================

    static async edit(
        message,
        configuration,
        context = {}
    ) {

        if (!message) {
            throw new Error(
                "A Discord message is required."
            );
        }

        const data =
            this.build(
                configuration,
                context
            );

        return message.edit(data);
    }
}


module.exports = MessageRenderer;
