module.exports = {

    prefix: ".",

    colors: {
        regular: 0x000000,
        success: 0xA9EB7F,
        failed: 0xFF6763
    },

    emojis: {
        success: "<:success:1541970152814551162>",
        failed: "<:failed:1541973642345185280>"
    },

    status: {
        enabled: true,
        text: "",
        type: 0,          // 0=Playing, 1=Streaming, 2=Listening, 3=Watching, 5=Competing
        status: "dnd",    // online, idle, dnd, invisible
        url: ""           // Only needed if type is 1 (Streaming)
    }

};
