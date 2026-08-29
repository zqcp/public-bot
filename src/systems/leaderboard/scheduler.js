// src/systems/leaderboard/scheduler.js

const Update =
    require("./update");

const Wipe =
    require("./wipe");


let timer = null;
let running = false;


async function run(client) {

    if (running) return;

    running = true;

    try {

        await Wipe.checkAll();
        await Update.update(client);

    } catch (error) {

        console.error(
            "[LEADERBOARD SCHEDULER]",
            error
        );

    } finally {

        running = false;

    }

}


function start(client) {

    if (timer) return;

    run(client);

    timer =
        setInterval(
            () => run(client),
            60 * 1000
        );

    console.log(
        "[LEADERBOARD] Scheduler started."
    );

}


function stop() {

    if (!timer) return;

    clearInterval(timer);

    timer = null;

}


module.exports = {
    start,
    stop,
    run
};
