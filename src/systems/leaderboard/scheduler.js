// src/systems/leaderboard/scheduler.js

const Update =
    require("./update");

const Wipe =
    require("./wipe");


const INTERVAL =
    60 * 1000;


let timer = null;
let running = false;


async function run(
    client
) {

    if (running) {
        return;
    }


    running = true;


    try {

        /*
         * Wipe expired weekly data first.
         */

        await Wipe.checkAll();


        /*
         * Update configured leaderboard
         * messages.
         */

        await Update.update(
            client
        );

    } catch (error) {

        console.error(
            "[LEADERBOARD] Scheduler error:",
            error
        );

    } finally {

        running = false;

    }

}


function start(
    client
) {

    if (timer) {
        return;
    }


    /*
     * Run immediately when the bot starts.
     */

    run(client);


    /*
     * Continue every minute.
     */

    timer =
        setInterval(
            () => run(client),
            INTERVAL
        );


    console.log(
        "[LEADERBOARD] Scheduler started."
    );

}


function stop() {

    if (!timer) {
        return;
    }


    clearInterval(
        timer
    );

    timer = null;


    console.log(
        "[LEADERBOARD] Scheduler stopped."
    );

}


module.exports = {

    start,

    stop,

    run

};
