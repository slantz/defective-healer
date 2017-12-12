"use strict";

const fs = require("fs");
const join = require("path").join;

function convertPeopleToTroll(PEOPLE_TO_TROLL) {
    function getMatchedPerson(next) {
        return next.match(/(\d+)\[(\w+)\]/i);
    }

    function assignPersonToHashMap(prev, next) {
        let id = Number(getMatchedPerson(next)[1]);
        let name = getMatchedPerson(next)[2];

        return Object.assign(prev,
            {
                [id] :
                    {
                        id : id,
                        name : name
                    }
            });
    }

    return PEOPLE_TO_TROLL
        .split(",")
        .reduce(assignPersonToHashMap, {}) || {};
}

function getFullUncutQuotes(quotesFileName) {
    let QUOTES_CUT = JSON.parse(fs.readFileSync(join(__dirname, quotesFileName)));

    QUOTES_CUT.GENERAL.DEFECTIVE_HEALING =
        JSON.parse(fs.readFileSync(join(__dirname, QUOTES_CUT.GENERAL.DEFECTIVE_HEALING)));

    return Object.assign({}, QUOTES_CUT);
}

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function getSkipMessagesMatch(text) {
    if (!text || typeof text !== "string") {
        return null;
    }

    let regexp = /^\/skip\s+(\d{1})$/i;
    return text.match(regexp);
}

function getMood(text) {
    if (!text || typeof text !== "string") {
        return null;
    }

    let regexp = /^\/setmood\s+(any|happy|angry|benevolent|pensive|excited|rude|polite|funny)$/i;
    return text.match(regexp);
}

function getCurrentMoodDescription(currentMood) {
    let description = "";

    switch (currentMood) {
        case "ANY":
            description = "у меня любое настроение";
            break;
        case "HAPPY":
            description = "я счастливый сейчас";
            break;
        case "ANGRY":
            description = "я злой, блять";
            break;
        case "BENEVOLENT":
            description = "я сегодня великодушный";
            break;
        case "PENSIVE":
            description = "я задумчивый";
            break;
        case "EXCITED":
            description = "я возбуждён";
            break;
        case "RUDE":
            description = "нахуй пошёл";
            break;
        case "POLITE":
            description = "я вежливый";
            break;
        case "FUNNY":
            description = "я весёлый";
            break;
    }

    return description;
}

function silenceForAmountOfMessages(silenceForAmountOfMessages) {
    return randomIntFromInterval(
        silenceForAmountOfMessages > 3
            ? silenceForAmountOfMessages - 3
            : 0,
        silenceForAmountOfMessages);
}

function isBotStartCommand(message) {
    return message.entities && message.text.includes("/start");
}

function startNewSession(ctx) {
    if (!isBotStartCommand(ctx.update.message)) {
        return;
    }

    ctx.session[ctx.update.message.chat.id] = {
        updated_at: ctx.update.message.date,
        chat: {
            id: ctx.update.message.chat.id,
            type: ctx.update.message.chat.type,
            first_name: ctx.update.message.chat.first_name,
            last_name: ctx.update.message.chat.last_name,
            username: ctx.update.message.chat.username,
            title: ctx.update.message.chat.title
        },
        settings: {
            currentMood: "ANY",
            currentMessage: 0,
            amountOfMessages: silenceForAmountOfMessages(3),
            silenceForAmountOfMessages: 3
        }
    };
}

function setCurrentMood(ctx, currentMood) {
    ctx.session[ctx.update.message.chat.id].settings.currentMood = currentMood;
}

function getCurrentMood(ctx) {
    return ctx.session[ctx.update.message.chat.id].settings.currentMood;
}

function setCurrentMessage(ctx, currentMessage) {
    ctx.session[ctx.update.message.chat.id].settings.currentMessage = currentMessage;
}

function getCurrentMessage(ctx) {
    return ctx.session[ctx.update.message.chat.id].settings.currentMessage;
}

function setAmountOfMessages(ctx, amountOfMessages) {
    ctx.session[ctx.update.message.chat.id].settings.amountOfMessages = amountOfMessages;
}

function getAmountOfMessages(ctx) {
    return ctx.session[ctx.update.message.chat.id].settings.amountOfMessages;
}

function setSilenceForAmountOfMessages(ctx, silenceForAmountOfMessages) {
    ctx.session[ctx.update.message.chat.id].settings.silenceForAmountOfMessages = silenceForAmountOfMessages;
}

function getSilenceForAmountOfMessages(ctx) {
    return ctx.session[ctx.update.message.chat.id].settings.silenceForAmountOfMessages;
}

function isSessionStarted(ctx) {
    return !!ctx.session[ctx.update.message.chat.id];
}

module.exports = {
    convertPeopleToTroll,
    getFullUncutQuotes,
    randomIntFromInterval,
    silenceForAmountOfMessages,
    getSkipMessagesMatch,
    getMood,
    getCurrentMoodDescription,
    startNewSession,
    isSessionStarted,
    setCurrentMood,
    getCurrentMood,
    setCurrentMessage,
    getCurrentMessage,
    setAmountOfMessages,
    getAmountOfMessages,
    setSilenceForAmountOfMessages,
    getSilenceForAmountOfMessages
};