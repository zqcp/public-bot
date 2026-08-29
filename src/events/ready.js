// src/events/ready.js

const config =
    require("../config");

const Scheduler =
    require("../systems/leaderboard/scheduler");


module.exports = {

    name: "ready",
    once: true,

    execute(client) {

        console.log(
            `${client.user.tag} is online`
        );


        if (
            config.status?.enabled
        ) {

            client.user.setPresence({

                activities: [
                    {
                        name:
                            config.status.text,

                        type:
                            config.status.type,

                        url:
                            config.status.url
                    }
                ],

                status:
                    config.status.status

            });

        }


        Scheduler.start(
            client
        );

    }

};
