const fs = require("fs");
const path = require("path");
const config = require("../config");
const GuildConfig = require("../models/GuildConfig");

module.exports = {

    load(client) {

        client.commands = new Map();


        const commandsPath = path.join(
            __dirname,
            "../commands"
        );


        function loadCommands(dir) {

            const files = fs.readdirSync(dir);


            for (const file of files) {

                const filePath = path.join(
                    dir,
                    file
                );


                if (fs.statSync(filePath).isDirectory()) {
                    loadCommands(filePath);
                    continue;
                }


                if (!file.endsWith(".js")) continue;


                const command = require(filePath);


                if (!command.name) continue;


                client.commands.set(
                    command.name.toLowerCase(),
                    command
                );


                if (command.aliases) {

                    for (const alias of command.aliases) {

                        client.commands.set(
                            alias.toLowerCase(),
                            command
                        );

                    }

                }


                console.log(
                    `Loaded command: ${command.name}`
                );

            }

        }


        loadCommands(commandsPath);

    },


    async handle(client, message) {

        if (message.author.bot) return;


        let prefix = config.prefix;


        if (message.guild) {

            const guildConfig = await GuildConfig.findOne({
                guildId: message.guild.id
            });


            if (guildConfig?.prefix) {
                prefix = guildConfig.prefix;
            }

        }


        if (!message.content.startsWith(prefix)) return;


        const content = message.content
            .slice(prefix.length)
            .trim();


        const args = content.split(/\s+/);


        let command = null;
        let commandName = "";


        // Check longer commands first
        for (let i = args.length; i > 0; i--) {

            const possibleCommand = args
                .slice(0, i)
                .join(" ")
                .toLowerCase();


            if (client.commands.has(possibleCommand)) {

                commandName = possibleCommand;

                command = client.commands.get(
                    possibleCommand
                );


                args.splice(0, i);

                break;

            }

        }


        if (!command) return;


        try {

            await command.execute(
                client,
                message,
                args
            );


        } catch (error) {

            console.error(
                `Command Error (${commandName}):`,
                error
            );

        }

    }

};
