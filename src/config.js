module.exports = {

    prefix: ".",

    colors: {
        regular: 0x000000,
        success: 0x57F288,
        failed: 0xFF6763
    },

    emojis: {
        success: "✅",
        failed: "❌"
    },

    status: {
        enabled: true,
        text: "",
        type: 0,          // 0=Playing, 1=Streaming, 2=Listening, 3=Watching, 5=Competing
        status: "dnd",    // online, idle, dnd, invisible
        url: ""           // Only needed if type is 1 (Streaming)
    }

};
