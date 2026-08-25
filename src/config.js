module.exports = {

    prefix: ",",

    colors: {
        regular: 0x3D3D45,
        error: 0xFAA819,
        role: 0x31BBDD,
        success: 0xA9EB7F,
        failed: 0xFF6763
    },

    emojis: {
        success: "<:successful:1534690890008891564>",
        failed: "<:failed:1534690786636202205>",
        error: "<:error:1534690869842804896>",

        // Command specific
        add: "<:add:1534690844672524319>",
        remove: "<:remove:1534690818743341257>"
    },

    status: {
        enabled: true,
        text: "",
        type: ,          // 0=Playing, 1=Streaming, 2=Listening, 3=Watching, 5=Competing
        status: "dnd", // online, idle, dnd, invisible
        url: ""           // Only needed if type is 1 (Streaming)
    }

};
