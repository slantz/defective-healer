"use strict";

require("dotenv").config();

const join = require("path").join;
const Telegraf = require("telegraf");
const session = require("telegraf/session");

const LOGGER = require(join(__dirname, "logger")).logger;
const UTIL = require(join(__dirname, "util"));
const CONSTANTS = require(join(__dirname, "constants"));

const QUOTES = UTIL.getFullUncutQuotes("quotes.json");

const bot = new Telegraf(process.env.BOT_TOKEN);

const PEOPLE_TO_TROLL = UTIL.convertPeopleToTroll(process.env.PEOPLE_TO_TROLL);

let silenceForAmountOfMessages = 3;
let amountOfMessages = UTIL.randomIntFromInterval(0,silenceForAmountOfMessages);
let currentMessage = 0;
let currentMood = "ANY";

bot.use(session());

bot.startPolling();

bot.context.db = {
    getAppeal: (id) => {
        let personToTroll = PEOPLE_TO_TROLL[id];

        if (!personToTroll) {
            return null;
        }

        let appealQuotesForName = QUOTES.USER_SPECIFIC[PEOPLE_TO_TROLL[id].name].TO;
        let defectiveQuotes = QUOTES.COMMON.DEFECTIVE_HEALING[QUOTES.COMMON.DEFECTIVE_HEALING.length - 1];

        let allQuotes = appealQuotesForName.concat(defectiveQuotes);

        let randomQuote = UTIL.randomIntFromInterval(0, allQuotes.length - 1);

        return allQuotes[randomQuote];
    },
    getHello: () => {
        let greetQuotes = Object.keys(QUOTES.COMMON.GREET);
        let randomQuote = UTIL.randomIntFromInterval(0, greetQuotes.length - 1);

        return QUOTES.COMMON.GREET[greetQuotes[randomQuote]];
    }
};

bot.start((ctx) => {
    LOGGER.warn("started by user id [%d]", ctx.from.id);
    return ctx.reply(`${QUOTES.COMMANDS.START}\t\n\t\n${QUOTES.COMMANDS.HELP}`);
});

/**
 * ORDER MATTERS:
 * 1. first commands
 * 2. regexps
 * 3. then on all tet if nothing is found
 */
bot.command("/foo", (ctx) => ctx.reply("Hello World"));

bot.command("/skip", (ctx) => {
    let matchedSkipMessages = UTIL.getSkipMessagesMatch(ctx.message.text);

    if (matchedSkipMessages === null) {
        return ctx.reply(
            "Набирай-ка ты правильно количество сообщений, " +
            "сколько от 0 до 9 пропускать, " +
            "например так '/skip 4'");
    }

    let amountOfMessages = Number(matchedSkipMessages[1]);
    let textEnding = "сообщений";

    switch (amountOfMessages) {
        case 1:
            textEnding = "сообщение";
            break;
        case 2:
        case 3:
        case 4:
            textEnding = "сообщения";
            break;
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
            textEnding = "сообщений";
            break;
    }

    silenceForAmountOfMessages = amountOfMessages;

    return ctx.reply(`Слушай-ка, ты, дэбильный, теперь мне прийдётся молчать ${amountOfMessages} ${textEnding}.`);
});

bot.command("/help", (ctx) => ctx.reply(QUOTES.COMMANDS.HELP));

bot.command("/setmood", (ctx) => {
    let matchedMessages = UTIL.getMood(ctx.message.text);

    if (matchedMessages === null) {
        return ctx.reply(
            "Ну, ты, походу, проверяешь меня, хер тебе, " +
            UTIL.getCurrentMoodDescription(currentMood) +
            ", " +
            "если хочешь пообщаться, звони мне с:\t\n" +
            "/setmood any         вездесущий\t\n" +
            "/setmood happy       счастливый\t\n" +
            "/setmood angry       злой\t\n" +
            "/setmood benevolent  великодушный\t\n" +
            "/setmood pensive     задумчивый\t\n" +
            "/setmood excited     возбуждённый\t\n" +
            "/setmood rude        грубый\t\n" +
            "/setmood polite      вежливый\t\n" +
            "/setmood funny       весёлый");
    }

    let newMood = matchedMessages[1];

    currentMood = newMood.toUpperCase();

    return ctx.reply(`теперь ${UTIL.getCurrentMoodDescription(currentMood)}, всё пока, не звони сюда больше.`);
});

bot.hears(CONSTANTS.REGEXPS.HI, (ctx) => {
    LOGGER.info("Somebody has greeted Slavik");
    return ctx.reply(ctx.db.getHello());
});

bot.hears(CONSTANTS.REGEXPS.FIND, (ctx) => {
    LOGGER.info("Somebody has threatened to find Slavik");
    ctx.reply("ну давай, вычисляй, вычисляй");
    ctx.replyWithLocation(CONSTANTS.SLAVIK_COORDS.lat, CONSTANTS.SLAVIK_COORDS.long);
});

bot.hears(CONSTANTS.REGEXPS.APPEAL,
    (ctx) => {
        LOGGER.info("Somebody has mentioned Slavik");

        const appealReply = ctx.db.getAppeal(ctx.message.from.id);

        if (appealReply) {
            return ctx.reply(`${ctx.message.from.first_name}, ${appealReply}`);
        }
});

bot.on("text", (ctx) => {
    LOGGER.info("message from [%d] and body", ctx.message.from.id, ctx.message);

    if (currentMessage < amountOfMessages) {
        return currentMessage++;
    }

    amountOfMessages = UTIL.randomIntFromInterval(
        silenceForAmountOfMessages > 3
            ? silenceForAmountOfMessages - 3
            : 0,
        silenceForAmountOfMessages);
    currentMessage = 0;

    // no quotes are selected for mood behavior yet
    if (currentMood === "ANY" || QUOTES.MOODS[currentMood].length === 0) {
        let randomPart = UTIL.randomIntFromInterval(0, QUOTES.COMMON.DEFECTIVE_HEALING.length - 1);
        let randomQuote = UTIL.randomIntFromInterval(0, QUOTES.COMMON.DEFECTIVE_HEALING[randomPart].length - 1);

        return ctx.reply(QUOTES.COMMON.DEFECTIVE_HEALING[randomPart][randomQuote]);
    }

    let randomQuote = UTIL.randomIntFromInterval(0, QUOTES.MOODS[currentMood].length - 1);
    return ctx.reply(QUOTES.MOODS[currentMood][randomQuote]);
});

bot.on("voice", (ctx) => {
    return ctx.reply("я вашей хуйни не понимаю");
});

bot.on("sticker", (ctx) => {
    LOGGER.info("message from [%d] with sticker file_id [%s] and body",
                ctx.message.from.id,
                ctx.message.sticker.file_id,
                ctx.message);
    if (UTIL.randomIntFromInterval(0, 5) === 1) {
        ctx.replyWithSticker(CONSTANTS.STICKER_IDS.EXTINGUISHER);
    }
});

bot.on("video", ctx => console.log(ctx.message));

bot.mention('SvyatoslavVictorovichBot', (ctx) => {
    console.log(111);
});

bot.hashtag('hashtag', (ctx) => {
    console.log(ctx.message);
    return ctx.reply(`${ctx.message.from.username}: ${score}`)
});

bot.catch((err) => {
    LOGGER.error("Error occured:", err);
});