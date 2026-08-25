const {
    Embed,
    createEmbed
} = require("./embed");

const {
    EmbedButtons,
    createButtons
} = require("./embedbuttons");

const {
    EmbedSelect,
    createSelect
} = require("./embedselect");

const {
    createVariables,
    resolveVariables,
    resolveObject
} = require("./embedvariables");


module.exports = {

    // ==========================================
    // EMBEDS
    // ==========================================

    Embed,
    createEmbed,


    // ==========================================
    // BUTTONS
    // ==========================================

    EmbedButtons,
    createButtons,


    // ==========================================
    // SELECT MENUS
    // ==========================================

    EmbedSelect,
    createSelect,


    // ==========================================
    // VARIABLES
    // ==========================================

    createVariables,
    resolveVariables,
    resolveObject
};
