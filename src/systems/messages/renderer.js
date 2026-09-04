const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    StringSelectMenuBuilder,
    UserSelectMenuBuilder,
    RoleSelectMenuBuilder,
    ChannelSelectMenuBuilder,
    MentionableSelectMenuBuilder
} = require("discord.js");

const variables = require("../variables");

module.exports = {

    render(messageData = {}, member = null) {

        const payload = {};

        /*
         * CONTENT
         */

        if (
            messageData.content !== null &&
            messageData.content !== undefined
        ) {

            const content =
                this.replaceValue(
                    messageData.content,
                    member
                );

            if (
                content !== null &&
                content !== undefined &&
                String(content).length > 0
            ) {

                payload.content =
                    String(content);

            }

        }

        /*
         * EMBEDS
         */

        if (
            Array.isArray(
                messageData.embeds
            )
        ) {

            const embeds = [];

            for (
                const embed of messageData.embeds
            ) {

                if (!embed) {
                    continue;
                }

                /*
                 * Already a Discord.js builder
                 */

                if (
                    embed instanceof EmbedBuilder
                ) {

                    embeds.push(embed);
                    continue;

                }

                if (
                    typeof embed !== "object"
                ) {

                    continue;

                }

                /*
                 * Clone saved embed data
                 */

                let data;

                try {

                    data =
                        JSON.parse(
                            JSON.stringify(embed)
                        );

                } catch (error) {

                    console.error(
                        "[MESSAGE RENDERER] Failed to clone embed:",
                        error
                    );

                    continue;

                }

                /*
                 * Resolve ALL variables recursively.
                 *
                 * This covers:
                 *
                 * title
                 * description
                 * url
                 * color
                 * author
                 * footer
                 * thumbnail
                 * image
                 * fields
                 * timestamp
                 * etc.
                 */

                data =
                    this.replaceValue(
                        data,
                        member
                    );

                /*
                 * Clean undefined/null values
                 * that Discord does not accept.
                 */

                data =
                    this.cleanValue(
                        data
                    );

                /*
                 * Discord embed requires useful data.
                 *
                 * Do not create empty embeds.
                 */

                if (
                    !data ||
                    typeof data !== "object" ||
                    !Object.keys(data).length
                ) {

                    continue;

                }

                /*
                 * Support saved helper format:
                 *
                 * footer.iconURL
                 *
                 * Discord API expects:
                 *
                 * footer.icon_url
                 */

                if (
                    data.footer?.iconURL &&
                    !data.footer.icon_url
                ) {

                    data.footer.icon_url =
                        data.footer.iconURL;

                    delete data.footer.iconURL;

                }

                /*
                 * Remove empty footer.
                 */

                if (data.footer) {

                    if (
                        !data.footer.text &&
                        !data.footer.icon_url
                    ) {

                        delete data.footer;

                    }

                }

                /*
                 * Remove empty author.
                 */

                if (data.author) {

                    if (
                        !data.author.name
                    ) {

                        delete data.author;

                    }

                }

                /*
                 * Remove empty thumbnail.
                 */

                if (
                    data.thumbnail &&
                    !data.thumbnail.url
                ) {

                    delete data.thumbnail;

                }

                /*
                 * Remove empty image.
                 */

                if (
                    data.image &&
                    !data.image.url
                ) {

                    delete data.image;

                }

                /*
                 * Remove invalid fields.
                 */

                if (
                    Array.isArray(
                        data.fields
                    )
                ) {

                    data.fields =
                        data.fields.filter(
                            field =>
                                field &&
                                typeof field === "object" &&
                                field.name !== undefined &&
                                field.value !== undefined
                        );

                    if (
                        !data.fields.length
                    ) {

                        delete data.fields;

                    }

                }

                try {

                    embeds.push(
                        new EmbedBuilder(data)
                    );

                } catch (error) {

                    console.error(
                        "[MESSAGE RENDERER] Invalid embed:",
                        error
                    );

                }

            }

            /*
             * Only send embeds if we actually
             * produced valid embeds.
             */

            if (embeds.length) {

                payload.embeds =
                    embeds;

            }

        }

        /*
         * COMPONENTS
         */

        if (
            Array.isArray(
                messageData.components
            )
        ) {

            const components = [];

            for (
                const component of messageData.components
            ) {

                if (!component) {
                    continue;
                }

                const rendered =
                    this.renderComponent(
                        component,
                        member
                    );

                /*
                 * Never send empty rows.
                 */

                if (
                    rendered &&
                    typeof rendered.toJSON ===
                        "function"
                ) {

                    let json;

                    try {

                        json =
                            rendered.toJSON();

                    } catch {

                        json = null;

                    }

                    if (
                        json?.components?.length
                    ) {

                        components.push(
                            rendered
                        );

                    }

                }

            }

            /*
             * Only include components when
             * at least one valid row exists.
             */

            if (components.length) {

                payload.components =
                    components;

            }

        }

        return payload;

    },

    /*
     * Recursively resolve variables.
     *
     * This is intentionally used on the
     * entire saved message structure.
     */

    replaceValue(value, member) {

        if (
            value === null ||
            value === undefined
        ) {

            return value;

        }

        /*
         * String
         */

        if (
            typeof value === "string"
        ) {

            if (!member) {

                return value;

            }

            try {

                return variables.replace(
                    value,
                    member
                );

            } catch (error) {

                console.error(
                    "[MESSAGE RENDERER] Variable replacement failed:",
                    error
                );

                return value;

            }

        }

        /*
         * Array
         */

        if (
            Array.isArray(value)
        ) {

            return value.map(
                item =>
                    this.replaceValue(
                        item,
                        member
                    )
            );

        }

        /*
         * Object
         */

        if (
            typeof value === "object"
        ) {

            const result = {};

            for (
                const [
                    key,
                    child
                ] of Object.entries(value)
            ) {

                result[key] =
                    this.replaceValue(
                        child,
                        member
                    );

            }

            return result;

        }

        /*
         * Number / boolean
         */

        return value;

    },

    /*
     * Remove null/undefined values recursively.
     */

    cleanValue(value) {

        if (
            value === null ||
            value === undefined
        ) {

            return undefined;

        }

        if (
            Array.isArray(value)
        ) {

            return value
                .map(
                    item =>
                        this.cleanValue(item)
                )
                .filter(
                    item =>
                        item !== undefined
                );

        }

        if (
            typeof value === "object"
        ) {

            const result = {};

            for (
                const [
                    key,
                    child
                ] of Object.entries(value)
            ) {

                const cleaned =
                    this.cleanValue(
                        child
                    );

                if (
                    cleaned !== undefined
                ) {

                    result[key] =
                        cleaned;

                }

            }

            return result;

        }

        return value;

    },

    renderComponent(
        component = {},
        member = null
    ) {

        /*
         * Already a Discord.js row
         */

        if (
            component instanceof ActionRowBuilder
        ) {

            return component;

        }

        if (
            !component ||
            typeof component !== "object"
        ) {

            return null;

        }

        /*
         * Resolve variables throughout
         * the saved component.
         */

        component =
            this.replaceValue(
                component,
                member
            );

        /*
         * Some saved systems store the
         * component directly instead of
         * inside an ActionRow.
         */

        if (
            component.type === 2 ||
            component.type === 3 ||
            component.type === 5 ||
            component.type === 6 ||
            component.type === 7 ||
            component.type === 8
        ) {

            const row =
                new ActionRowBuilder();

            const rendered =
                this.renderSingleComponent(
                    component
                );

            if (rendered) {

                row.addComponents(
                    rendered
                );

                return row;

            }

            return null;

        }

        /*
         * Normal saved ActionRow.
         */

        if (
            !Array.isArray(
                component.components
            )
        ) {

            return null;

        }

        const row =
            new ActionRowBuilder();

        for (
            const item of component.components
        ) {

            if (!item) {
                continue;
            }

            const rendered =
                this.renderSingleComponent(
                    item
                );

            if (rendered) {

                row.addComponents(
                    rendered
                );

            }

        }

        /*
         * Never return an empty row.
         */

        try {

            if (
                !row.toJSON()?.components?.length
            ) {

                return null;

            }

        } catch {

            return null;

        }

        return row;

    },

    renderSingleComponent(
        item = {}
    ) {

        /*
         * Already a Discord.js builder
         */

        if (
            typeof item.toJSON ===
            "function"
        ) {

            return item;

        }

        if (
            !item ||
            typeof item !== "object"
        ) {

            return null;

        }

        /*
         * BUTTON
         */

        if (
            item.type === 2 ||
            item.type === "button"
        ) {

            try {

                return new ButtonBuilder(
                    this.cleanValue(
                        item
                    )
                );

            } catch (error) {

                console.error(
                    "[MESSAGE RENDERER] Invalid button:",
                    error
                );

                return null;

            }

        }

        /*
         * STRING SELECT
         */

        if (
            item.type === 3 ||
            item.type === "string"
        ) {

            try {

                return new StringSelectMenuBuilder(
                    this.cleanValue(
                        item
                    )
                );

            } catch (error) {

                console.error(
                    "[MESSAGE RENDERER] Invalid string select:",
                    error
                );

                return null;

            }

        }

        /*
         * USER SELECT
         */

        if (
            item.type === 5 ||
            item.type === "user"
        ) {

            try {

                return new UserSelectMenuBuilder(
                    this.cleanValue(
                        item
                    )
                );

            } catch (error) {

                console.error(
                    "[MESSAGE RENDERER] Invalid user select:",
                    error
                );

                return null;

            }

        }

        /*
         * ROLE SELECT
         */

        if (
            item.type === 6 ||
            item.type === "role"
        ) {

            try {

                return new RoleSelectMenuBuilder(
                    this.cleanValue(
                        item
                    )
                );

            } catch (error) {

                console.error(
                    "[MESSAGE RENDERER] Invalid role select:",
                    error
                );

                return null;

            }

        }

        /*
         * MENTIONABLE SELECT
         */

        if (
            item.type === 7 ||
            item.type === "mentionable"
        ) {

            try {

                return new MentionableSelectMenuBuilder(
                    this.cleanValue(
                        item
                    )
                );

            } catch (error) {

                console.error(
                    "[MESSAGE RENDERER] Invalid mentionable select:",
                    error
                );

                return null;

            }

        }

        /*
         * CHANNEL SELECT
         */

        if (
            item.type === 8 ||
            item.type === "channel"
        ) {

            try {

                return new ChannelSelectMenuBuilder(
                    this.cleanValue(
                        item
                    )
                );

            } catch (error) {

                console.error(
                    "[MESSAGE RENDERER] Invalid channel select:",
                    error
                );

                return null;

            }

        }

        return null;

    },

    renderSelect(select = {}) {

        if (
            select.type === "role"
        ) {

            return new RoleSelectMenuBuilder(
                this.cleanValue(
                    select
                )
            );

        }

        if (
            select.type === "user"
        ) {

            return new UserSelectMenuBuilder(
                this.cleanValue(
                    select
                )
            );

        }

        if (
            select.type === "channel"
        ) {

            return new ChannelSelectMenuBuilder(
                this.cleanValue(
                    select
                )
            );

        }

        if (
            select.type === "mentionable"
        ) {

            return new MentionableSelectMenuBuilder(
                this.cleanValue(
                    select
                )
            );

        }

        return new StringSelectMenuBuilder(
            this.cleanValue(
                select
            )
        );

    }

};
