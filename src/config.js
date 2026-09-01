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
        success: "<:success:1541970152814551162>",
        failed: "<:failed:1541973642345185280>",
        error: "<:error:1541970187786653797>",

        // Command specific
        add: "<:add:1541970245453873313>",
        remove: "<:remove:1541970285715132416>"
    },

    status: {
        enabled: true,
        text: "",
        type: 0,          // 0=Playing, 1=Streaming, 2=Listening, 3=Watching, 5=Competing
        status: "dnd", // online, idle, dnd, invisible
        url: ""           // Only needed if type is 1 (Streaming)
    }

};
