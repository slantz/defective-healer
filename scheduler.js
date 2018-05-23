const schedule = require('node-schedule');

const join = require("path").join;
const UTIL = require(join(__dirname, "util"));
const CONSTANTS = require(join(__dirname, "constants"));

module.exports = function({bot, chatsToTroll, quotes}) {

    function getChatToTroll(chatName) {
        let chatId = null;

        Object.keys(chatsToTroll).forEach((key) => {
            if (chatsToTroll[key].name === chatName) {
                chatId = chatsToTroll[key].id;
            }
        });

        return chatId;
    }

    function lol() {
        let randomPart = UTIL.randomIntFromInterval(0, quotes.GENERAL.DEFECTIVE_HEALING.length - 1);
        let randomPartQuotes = quotes.GENERAL.DEFECTIVE_HEALING[randomPart];

        let randomQuote = UTIL.randomIntFromInterval(0, randomPartQuotes.length - 1);

        bot.telegram.sendMessage(getChatToTroll("tawerna"), randomPartQuotes[randomQuote]);
    }

    const TROLL_MINUTE_START = UTIL.randomIntFromInterval(CONSTANTS.TROLL_TIME.MINUTES_RANGE.MIN, CONSTANTS.TROLL_TIME.MINUTES_RANGE.MAX);
    const TROLL_MINUTES = `${TROLL_MINUTE_START}-${TROLL_MINUTE_START + 2}`;
    const TROLL_HOUR = UTIL.randomIntFromInterval(CONSTANTS.TROLL_TIME.HOURS_RANGE.MIN, CONSTANTS.TROLL_TIME.HOURS_RANGE.MAX);

    schedule.scheduleJob(`*/10 ${TROLL_MINUTES} ${TROLL_HOUR} * * *`, function() {
        lol();
    });
};