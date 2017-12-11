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
const ADMINS = UTIL.convertPeopleToTroll(process.env.ADMINS);

let silenceForAmountOfMessages = 3;
let amountOfMessages = UTIL.silenceForAmountOfMessages(silenceForAmountOfMessages);
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
        let defectiveQuotes = QUOTES.GENERAL.DEFECTIVE_HEALING[QUOTES.GENERAL.DEFECTIVE_HEALING.length - 1];
        let singingQuotes = QUOTES.GENERAL.SINGING[QUOTES.GENERAL.SINGING.length - 1];


        let allQuotes;
        switch (PEOPLE_TO_TROLL[id].name) {
            case "al":
                allQuotes = appealQuotesForName.concat(singingQuotes);
                break;
            default:
                allQuotes = appealQuotesForName.concat(defectiveQuotes);
        }

        let randomQuote = UTIL.randomIntFromInterval(0, allQuotes.length - 1);

        return allQuotes[randomQuote];
    },
    getHello: () => {
        let greetQuotes = Object.keys(QUOTES.GENERAL.GREET);
        let randomQuote = UTIL.randomIntFromInterval(0, greetQuotes.length - 1);

        return QUOTES.GENERAL.GREET[greetQuotes[randomQuote]];
    },
    isAdmin: (id) => {
        return ADMINS[id] !== null;
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
 * 3. hashtags
 * 4. then on all tet if nothing is found
 */
bot.command("/foo", (ctx) => ctx.reply("Hello World"));

bot.command("/skip", (ctx) => {
    let matchedSkipMessages = UTIL.getSkipMessagesMatch(ctx.message.text);

    if (matchedSkipMessages === null) {
        return ctx.replyWithMarkdown(
            "Набирай-ка ты правильно количество сообщений, " +
            "сколько от _0_ до _9_ пропускать, " +
            "например так `/skip 4`");
    }

    silenceForAmountOfMessages = Number(matchedSkipMessages[1]);
    amountOfMessages = UTIL.silenceForAmountOfMessages(silenceForAmountOfMessages);
    currentMessage = 0;

    let textEnding = "сообщений";

    switch (silenceForAmountOfMessages) {
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

    return ctx.replyWithMarkdown(`Слушай-ка, ты, дэбильный, теперь мне прийдётся молчать \`${silenceForAmountOfMessages} ${textEnding}.\``);
});

bot.command("/take_it_easy", (ctx) => {
    silenceForAmountOfMessages = 20;
    amountOfMessages = UTIL.silenceForAmountOfMessages(silenceForAmountOfMessages);
    currentMessage = 0;

    return ctx.reply(`Ну ты опущенка, теперь мне надо попуститься до ${silenceForAmountOfMessages} сообщений.`);
});

bot.command("/help", (ctx) => ctx.reply(QUOTES.COMMANDS.HELP));

bot.command("/setmood", (ctx) => {
    let matchedMessages = UTIL.getMood(ctx.message.text);

    if (matchedMessages === null) {
        return ctx.replyWithMarkdown(
            "Ну, ты, походу, проверяешь меня, хер тебе, " +
            "`" + UTIL.getCurrentMoodDescription(currentMood) + "`" +
            ", " +
            "если хочешь пообщаться, звони мне с:\t\n" +
            "```\n"+
            "/setmood any         вездесущий\t\n" +
            "/setmood happy       счастливый\t\n" +
            "/setmood angry       злой\t\n" +
            "/setmood benevolent  великодушный\t\n" +
            "/setmood pensive     задумчивый\t\n" +
            "/setmood excited     возбуждённый\t\n" +
            "/setmood rude        грубый\t\n" +
            "/setmood polite      вежливый\t\n" +
            "/setmood funny       весёлый\t\n" +
            "```");

    }

    let newMood = matchedMessages[1];

    currentMood = newMood.toUpperCase();

    return ctx.reply(`теперь ${UTIL.getCurrentMoodDescription(currentMood)}, всё пока, не звони сюда больше.`);
});

// bot.command("/stop", (ctx) => {
//     if (ctx.db.isAdmin(ctx.from.id)) {
//         return bot.stop(() => {
//             LOGGER.warn("stoped by user id [%d]", ctx.from.id);
//         });
//     }
// });

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
            return ctx.replyWithMarkdown(`[${ctx.message.from.first_name}](tg://user?id=${ctx.message.from.id}), ${appealReply}`);
        }
});

bot.hears(CONSTANTS.REGEXPS.RICH_BITCH, (ctx) => {
    LOGGER.info("Someone has started real money talk");

    if (UTIL.randomIntFromInterval(0, 1) === 1) {
        return ctx.replyWithSticker(CONSTANTS.STICKER_IDS.BUSINESS_LESSON);
    }

    let randomQuote = UTIL.randomIntFromInterval(0, QUOTES.GENERAL.REAL_MONEY_TALK.length - 1);
    return ctx.reply(QUOTES.GENERAL.REAL_MONEY_TALK[randomQuote]);
});

bot.hears(CONSTANTS.REGEXPS.SINGING, (ctx) => {
    LOGGER.info("Someone wants to sing");

    let randomQuote = UTIL.randomIntFromInterval(0, QUOTES.GENERAL.SINGING.length - 1);
    return ctx.reply(QUOTES.GENERAL.SINGING[randomQuote]);
});

bot.hears(CONSTANTS.REGEXPS.VASYA, (ctx) => {
    LOGGER.info("Someone wants to hear poem about Vasya");

    let randomQuote = UTIL.randomIntFromInterval(0, QUOTES.GENERAL.VASYA.length - 1);
    return ctx.reply(QUOTES.GENERAL.VASYA[randomQuote]);
});

bot.hears(CONSTANTS.REGEXPS.TEA_TIME, (ctx) => {
    LOGGER.info("Someone wants to have a break");

    let randomQuote = UTIL.randomIntFromInterval(0, QUOTES.GENERAL.TEA_TIME.length - 1);
    return ctx.reply(QUOTES.GENERAL.TEA_TIME[randomQuote]);
});

bot.hears(CONSTANTS.REGEXPS.GANG, (ctx) => {
    LOGGER.info("Someone has started gang talk");

    let randomQuote = UTIL.randomIntFromInterval(0, QUOTES.GENERAL.GANG.length - 1);
    return ctx.reply(QUOTES.GENERAL.GANG[randomQuote]);
});

bot.hashtag(CONSTANTS.HASHTAGS.MEMORIZE, (ctx) => {
    LOGGER.info("hashtag from [%d] with id [%s] and body",
        ctx.message.from.id,
        ctx.message.text.substring(ctx.message.entities[0].offset, ctx.message.entities[0].length),
        ctx.message.text.substring(ctx.message.entities[0].offset + ctx.message.entities[0].length));

    return ctx.reply("запомнил Ваше сообщение");
});

bot.on("text", (ctx) => {
    LOGGER.info("message from [%d] and body", ctx.message.from.id, ctx.message);

    if (currentMessage < amountOfMessages) {
        return currentMessage++;
    }

    amountOfMessages = UTIL.silenceForAmountOfMessages(silenceForAmountOfMessages);
    currentMessage = 0;

    // no quotes are selected for mood behavior yet
    if (currentMood === "ANY" || QUOTES.MOODS[currentMood].length === 0) {
        let randomPart = UTIL.randomIntFromInterval(0, QUOTES.GENERAL.DEFECTIVE_HEALING.length - 1);
        let allQuotes = QUOTES.GENERAL.DEFECTIVE_HEALING[randomPart].concat(QUOTES.GENERAL.RANDOM);

        let randomQuote = UTIL.randomIntFromInterval(0, allQuotes.length - 1);

        return ctx.reply(allQuotes[randomQuote]);
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
    if (UTIL.randomIntFromInterval(0, 3) === 1) {
        ctx.replyWithSticker(CONSTANTS.STICKER_IDS.EXTINGUISHER);
    }
});

bot.on("video", ctx => console.log(ctx.message));

bot.mention('SvyatoslavVictorovichBot', (ctx) => {
    console.log(111);
});

bot.catch((err) => {
    LOGGER.error("Error occured:", err);
});