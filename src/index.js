require("dotenv").config();

const express = require("express");

const {
    Client,
    GatewayIntentBits,
    Partials
} = require("discord.js");

const mongoose = require("mongoose");
const {
    DefaultWebSocketManagerOptions
} = require("@discordjs/ws");


// =========================
// HANDLERS
// =========================

const CommandHandler =
    require("./handlers/commandHandler");

const EventHandler =
    require("./handlers/eventHandler");

const InteractionHandler =
    require("./handlers/interactionHandler");


// =========================
// BETTERSTACK / UPTIME
// =========================

const app = express();

const PORT =
    process.env.PORT || 3000;


app.get("/", (req, res) => {

    res.status(200).send(
        "Bot is online"
    );

});


app.listen(PORT, () => {

    console.log(
        `Uptime server running on port ${PORT}`
    );

});


// =========================
// MOBILE STATUS
// =========================

DefaultWebSocketManagerOptions
    .identifyProperties
    .browser = "Discord Android";


// =========================
// CLIENT
// =========================

const client = new Client({

    intents: [

        GatewayIntentBits.Guilds,

        GatewayIntentBits.GuildMembers,

        GatewayIntentBits.GuildModeration,

        GatewayIntentBits.GuildExpressions,

        GatewayIntentBits.GuildIntegrations,

        GatewayIntentBits.GuildWebhooks,

        GatewayIntentBits.GuildInvites,

        GatewayIntentBits.GuildVoiceStates,

        GatewayIntentBits.GuildPresences,

        GatewayIntentBits.GuildMessages,

        GatewayIntentBits.GuildMessageReactions,

        GatewayIntentBits.GuildMessageTyping,

        GatewayIntentBits.DirectMessages,

        GatewayIntentBits.DirectMessageReactions,

        GatewayIntentBits.DirectMessageTyping,

        GatewayIntentBits.MessageContent,

        GatewayIntentBits.AutoModerationConfiguration,

        GatewayIntentBits.AutoModerationExecution

    ],

    partials: [

        Partials.Channel,

        Partials.Message,

        Partials.User,

        Partials.GuildMember,

        Partials.Reaction,

        Partials.ThreadMember

    ]

});


// =========================
// COMMAND HANDLER
// =========================

CommandHandler.load(client);


// =========================
// EVENT HANDLER
// =========================

EventHandler.load(client);


// =========================
// INTERACTION HANDLER
// =========================

InteractionHandler.loadInteractions(client);

InteractionHandler.register(client);


// =========================
// DATABASE
// =========================

async function connectDatabase() {

    if (!process.env.MONGO_URI) {

        console.log(
            "MongoDB URI missing, skipping database."
        );

        return;

    }


    try {

        await mongoose.connect(
            process.env.MONGO_URI
        );


        console.log(
            "MongoDB connected"
        );


    } catch (error) {

        console.error(
            "MongoDB connection failed:",
            error
        );

    }

}


// =========================
// START BOT
// =========================

async function start() {

    await connectDatabase();


    try {

        await client.login(
            process.env.TOKEN
        );


    } catch (error) {

        console.error(
            "Bot login failed:",
            error
        );

    }

}


start();
