const fs = require("fs");
const path = require("path");

module.exports = {

    load(client) {

        const folders = [
            "events",
            "systems"
        ];

        for (const folder of folders) {

            const folderPath = path.join(
                __dirname,
                `../${folder}`
            );

            if (!fs.existsSync(folderPath)) {
                continue;
            }

            this.loadFolder(
                client,
                folderPath
            );

        }

    },

    loadFolder(client, folderPath) {

        const files = fs.readdirSync(
            folderPath
        );

        for (const file of files) {

            const filePath = path.join(
                folderPath,
                file
            );

            if (fs.statSync(filePath).isDirectory()) {

                this.loadFolder(
                    client,
                    filePath
                );

                continue;
            }

            if (!file.endsWith(".js")) continue;

            const handler = require(
                filePath
            );

            if (!handler.name || !handler.execute) {
                continue;
            }

            if (handler.once) {

                client.once(
                    handler.name,
                    (...args) =>
                        handler.execute(
                            ...args,
                            client
                        )
                );

            } else {

                client.on(
                    handler.name,
                    (...args) =>
                        handler.execute(
                            ...args,
                            client
                        )
                );

            }

            console.log(
                `Loaded ${handler.name}: ${file}`
            );

        }

    }

};
