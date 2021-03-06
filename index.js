"use strict";

require("dotenv").config();

const join = require("path").join;
const Telegraf = require("telegraf");
const session = require("telegraf/session");

const LOGGER = require(join(__dirname, "logger")).logger;
const UTIL = require(join(__dirname, "util"));
const CONSTANTS = require(join(__dirname, "constants"));

const QUOTES = UTIL.getFullUncutQuotes(CONSTANTS.FILES.QUOTES);

const SESSIONS = UTIL.getSessions(LOGGER);

const bot = new Telegraf(process.env.BOT_TOKEN);

const PEOPLE_TO_TROLL = UTIL.convertPeopleToTroll(process.env.PEOPLE_TO_TROLL);
const ADMINS = UTIL.convertPeopleToTroll(process.env.ADMINS);
const SESSIONS_TO_IGNORE = UTIL.convertPeopleToTroll(process.env.SESSIONS_TO_IGNORE);
const CHATS_TO_TROLL = UTIL.convertPeopleToTroll(process.env.CHATS_TO_TROLL);

const SCHEDULER = require(join(__dirname, "scheduler"))({
    bot: bot,
    chatsToTroll: CHATS_TO_TROLL,
    quotes: QUOTES
});

let areSessionsChecked = false;

/**
 * this override is necessary for local custom storing session logic to work,
 * as of now session is created for each user in every chat separately by default
 * see `${ctx.from.id}:${ctx.chat.id}`.
 */
bot.use(session({
    getSessionKey: (ctx) => ctx.chat && `${ctx.chat.id}`
}));

bot.use((ctx, next) => {
    if (UTIL.startNewSession(ctx, SESSIONS)) {
        UTIL.storeSessions(ctx.session, ctx.update.message.chat.id, LOGGER);
    }

    if (UTIL.isSessionStarted(ctx)) {
        return next(ctx);
    }

    return null;
});

bot.startPolling();

bot.context.db = {
    getAppeal: (id) => {
        let personToTroll = PEOPLE_TO_TROLL[id];

        if (!personToTroll) {
            return null;
        }

        let appealQuotesForName = QUOTES.USER_SPECIFIC[PEOPLE_TO_TROLL[id].name].TO;
        let singingQuotes = QUOTES.GENERAL.SINGING[QUOTES.GENERAL.SINGING.length - 1];


        let allQuotes = [];
        switch (PEOPLE_TO_TROLL[id].name) {
            case "al":
                allQuotes = appealQuotesForName.concat(singingQuotes);
                break;
            default:
                allQuotes = [].concat(appealQuotesForName);

                Object.keys(QUOTES.GENERAL.DEFECTIVE_HEALING).forEach(quotesSetKey => {
                    if (quotesSetKey !== "length") {
                        allQuotes = allQuotes.concat(QUOTES.GENERAL.DEFECTIVE_HEALING[quotesSetKey]);
                    }
                });
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

    UTIL.setSilenceForAmountOfMessages(ctx, Number(matchedSkipMessages[1]), LOGGER);
    UTIL.setAmountOfMessages(ctx, UTIL.silenceForAmountOfMessages(UTIL.getSilenceForAmountOfMessages(ctx)), LOGGER);
    UTIL.setCurrentMessage(ctx, 0, LOGGER);
    UTIL.updateSessions(ctx, LOGGER);

    let textEnding = "сообщений";

    switch (UTIL.getSilenceForAmountOfMessages(ctx)) {
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

    return ctx.replyWithMarkdown(`Слушай-ка, ты, дэбильный, теперь мне прийдётся молчать \`${UTIL.getSilenceForAmountOfMessages(ctx)} ${textEnding}.\``);
});

bot.command("/take_it_easy", (ctx) => {
    UTIL.setSilenceForAmountOfMessages(ctx, 20, LOGGER);
    UTIL.setAmountOfMessages(ctx, UTIL.silenceForAmountOfMessages(UTIL.getSilenceForAmountOfMessages(ctx)), LOGGER);
    UTIL.setCurrentMessage(ctx, 0, LOGGER);
    UTIL.updateSessions(ctx, LOGGER);

    return ctx.reply(`Ну ты опущенка, теперь мне надо попуститься до ${UTIL.getSilenceForAmountOfMessages(ctx)} сообщений.`);
});

bot.command("/help", (ctx) => ctx.reply(QUOTES.COMMANDS.HELP));

bot.command("/setmood", (ctx) => {
    let matchedMessages = UTIL.getMood(ctx.message.text);

    if (matchedMessages === null) {
        return ctx.replyWithMarkdown(
            "Ну, ты, походу, проверяешь меня, хер тебе, " +
            "`" + UTIL.getCurrentMoodDescription(UTIL.getCurrentMood(ctx)) + "`" +
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

    UTIL.setCurrentMood(ctx, newMood.toUpperCase(), LOGGER);
    UTIL.updateSessions(ctx, LOGGER);

    return ctx.reply(`теперь ${UTIL.getCurrentMoodDescription(UTIL.getCurrentMood(ctx))}, всё пока, не звони сюда больше.`);
});

bot.command("/stats", (ctx) => {
    LOGGER.info("this guy [%d] wants to get stats", ctx.message.from.id);

    if (!ctx.db.isAdmin(ctx.message.from.id)) {
        return;
    }

    try {
        let activeSessions = UTIL.getSessions(LOGGER);

        if (activeSessions !== null && Object.keys(activeSessions) !== 0) {
            return ctx.replyWithMarkdown(`These are the active sessions:\t\n\n[[\n${Object
                .keys(activeSessions)
                .map((id, index) => (index !== 0 ? "\n\n" : "") 
                    + "\t\tid: "  
                    + activeSessions[id].chat.id + "\t\n\t\ttype: " 
                    + activeSessions[id].chat.type + "\t\n" 
                    + (activeSessions[id].chat.type === "private" ? "\t\tfirst_name: " : "")
                    + (activeSessions[id].chat.type === "private" ? activeSessions[id].chat.first_name : "")
                    + (activeSessions[id].chat.type === "private" ? "\n\t\tlast_name: " : "\t\tchat title: ")
                    + (activeSessions[id].chat.type === "private" ? activeSessions[id].chat.last_name : activeSessions[id].chat.title))}\t\n]]
            `);
        }
    }
    catch (e) {
        return ctx.reply(`Some unexpected error happened while fetching active sessions: [${e}]`);
    }
});

bot.command("/ids_from_info_logs", (ctx) => {
    LOGGER.info("this guy [%d] wants to ids of all users from info logs", ctx.message.from.id);

    if (!ctx.db.isAdmin(ctx.message.from.id)) {
        return;
    }

    let response = ctx.reply("подожди, дай мне распарсить");

    try {
        let idsFromInfoLogs = UTIL.getIdsFromInfoLogs(LOGGER)
            .map((id, index) => (index !== 0 ? "\n\n" : "")
                + "\t\tid: "
                + id)
            .filter((item, pos, array) => array.map((mapItem) => mapItem.trim()).indexOf(item.trim()) === pos);

        let idsFromInfoLogsSplits = [];

        for (let i = 0, max = 100; i < max; i=i+100) {
            idsFromInfoLogsSplits.push(idsFromInfoLogs.slice(i, i+max));
        }

        for (let i = 0; i < idsFromInfoLogsSplits.length; i++) {
            (function(newi){
                response.then(() => {
                    response = ctx.replyWithMarkdown(`These are ids from info logs:\t\n\n[[\n${idsFromInfoLogsSplits[newi]}\t\n]]`);
                });
            })(i);
        }

        return response;
    }
    catch (e) {
        return ctx.reply(`Some unexpected error happened while fetching ids from info logs: [${e}]`);
    }
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

    if (UTIL.ignoreSession(ctx.session.chat.id, SESSIONS_TO_IGNORE)) {
        return;
    }

    if (UTIL.randomIntFromInterval(0, 10) === 7) {
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

bot.hears(CONSTANTS.REGEXPS.DAWG, (ctx) => {
    LOGGER.info("Someone wants to understand real dawg life");

    let randomQuote = UTIL.randomIntFromInterval(0, QUOTES.GENERAL.DAWG.length - 1);
    return ctx.reply(QUOTES.GENERAL.DAWG[randomQuote]);
});

bot.hears(CONSTANTS.REGEXPS.TEA_TIME, (ctx) => {
    LOGGER.info("Someone wants to have a break");

    let randomQuote = UTIL.randomIntFromInterval(0, QUOTES.GENERAL.TEA_TIME.length - 1);
    return ctx.reply(QUOTES.GENERAL.TEA_TIME[randomQuote]);
});

bot.hears(CONSTANTS.REGEXPS.GANG, (ctx) => {
    LOGGER.info("Someone has started gang talk");

    if (UTIL.ignoreSession(ctx.session.chat.id, SESSIONS_TO_IGNORE)) {
        return;
    }

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

    let currentMessage = UTIL.getCurrentMessage(ctx);
    let amountOfMessages = UTIL.getAmountOfMessages(ctx);

    if (currentMessage < amountOfMessages) {
        return UTIL.setCurrentMessage(ctx, currentMessage + 1, LOGGER);
    }

    UTIL.setAmountOfMessages(ctx, UTIL.silenceForAmountOfMessages(UTIL.getSilenceForAmountOfMessages(ctx)), LOGGER);
    UTIL.setCurrentMessage(ctx, 0, LOGGER);
    UTIL.updateSessions(ctx, LOGGER);

    // no quotes are selected for mood behavior yet
    if (UTIL.getCurrentMood(ctx) === "ANY" || QUOTES.MOODS[UTIL.getCurrentMood(ctx)].length === 0) {
        let randomPart = UTIL.randomIntFromInterval(0, QUOTES.GENERAL.DEFECTIVE_HEALING.length - 1);
        // removed random quotes array, since it's bigger than other sub arrays and probabilit of repeating the quote is huge > 50%
        let allQuotes = QUOTES.GENERAL.DEFECTIVE_HEALING[randomPart]; //.concat(QUOTES.GENERAL.RANDOM);

        let randomQuote = UTIL.randomIntFromInterval(0, allQuotes.length - 1);

        return ctx.reply(allQuotes[randomQuote]);
    }

    let randomQuote = UTIL.randomIntFromInterval(0, QUOTES.MOODS[UTIL.getCurrentMood(ctx)].length - 1);
    return ctx.reply(QUOTES.MOODS[UTIL.getCurrentMood(ctx)][randomQuote]);
});

bot.on("voice", (ctx) => {
    return ctx.reply("я вашей хуйни не понимаю");
});

bot.on("sticker", (ctx) => {
    LOGGER.info("message from [%d] with sticker file_id [%s] and body",
                ctx.message.from.id,
                ctx.message.sticker.file_id,
                ctx.message);
    if (UTIL.randomIntFromInterval(0, 10) === 1) {
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