"use strict";

require("dotenv").config();

const fs = require("fs");
const join = require("path").join;
const Telegraf = require("telegraf");

const LOGGER = require(join(__dirname, "logger")).logger;
const UTIL = require(join(__dirname, "util"));
const CONSTANTS = require(join(__dirname, "constants"));

const QUOTES = JSON.parse(fs.readFileSync(join(__dirname, "quotes.json")));

const bot = new Telegraf(process.env.BOT_TOKEN);

const PEOPLE_TO_TROLL = UTIL.convertPeopleToTroll(process.env.PEOPLE_TO_TROLL);

bot.startPolling();

bot.context.db = {
    getScores: () => { return 42 },
    getLol: (username) => {
        if (username !== "kblnsk") {
            return null;
        }

        return "алина певитса @ гмейл ком";
    },
    getHello: () => { return QUOTES.COMMON.GREET.ALL_HELLO; }
};

bot.start((ctx) => {
    console.log("started:", ctx.from.id);
    return ctx.reply(QUOTES.COMMANDS.START);
});

/**
 * ORDER MATTERS:
 * 1. first commands
 * 2. regexps
 * 3. then on all tet if nothing is found
 */
bot.command("/foo", (ctx) => ctx.reply("Hello World"));

bot.hears(/привет/i, (ctx) => {
    LOGGER.info("Somebody has greeted Slavik");
    return ctx.reply(ctx.db.getHello());
});

bot.hears(/вычислим/i, (ctx) => {
    LOGGER.info("Somebody has threatened to find Slavik");
    ctx.reply("ну давай, вычисляй, вычисляй");
    ctx.replyWithLocation(CONSTANTS.SLAVIK_COORDS.lat, CONSTANTS.SLAVIK_COORDS.long);
});

bot.on("text", (ctx) => {
    LOGGER.info("this is the message object [%s]", ctx.message);
    console.log(ctx.message);
    // console.log(ctx.message.entities[0].user);
    // const score = ctx.db.getLol(ctx.message.from.username);
    // if (score) {
    //     return ctx.reply(`${ctx.message.from.username}: ${score}`)
    // }
});

bot.on("voice", (ctx) => {
    console.log("я вашей хуйни не понимаю");
})

bot.on("sticker", (ctx) => {
    console.log("я вашей хуйни не понимаю");
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
    console.log("Ooops", err)
});