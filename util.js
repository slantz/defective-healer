"use strict";

const fs = require("fs");
const join = require("path").join;

const CONSTANTS = require(join(__dirname, "constants"));

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

function storeSessions(sessions, logger) {
    if (sessions !== null && Object.keys(sessions).length !== 0) {
        fs.writeFile(join(__dirname, CONSTANTS.FILES.SESSIONS), JSON.stringify(sessions), "utf8", (err) => {
            if (err) {
                logger.error(`Error occured [${CONSTANTS.CODES.ERRORS.SESSIONS_WRITE_ERROR}]:`, err);
            }
            else {
                logger.warn(`WARNING: [${CONSTANTS.CODES.SUCCESS.SESSIONS_WRITE_SUCCESS}]: sessions has been stored.`, sessions);
            }
        });
    }
}

function getSessions(logger) {
    try {
        return Object.assign({}, JSON.parse(fs.readFileSync(join(__dirname, CONSTANTS.FILES.SESSIONS))));
    }
    catch (e) {
        logger.error(`Error occured [${CONSTANTS.CODES.ERRORS.NO_SESSIONS_FILE_EXIST}], creating new ${join(__dirname, CONSTANTS.FILES.SESSIONS)}: `, e);
        try {
            fs.appendFileSync(join(__dirname, CONSTANTS.FILES.SESSIONS), "", {flags: "w+"});
        }
        catch (ee) {
            logger.error(`Error occured [${CONSTANTS.CODES.ERRORS.CREATE_NEW_FILE_FAILED}]`, ee);
        }
        return Object.assign({});
    }
}

function startNewSession(ctx) {
    if (!isBotStartCommand(ctx.update.message)) {
        return false;
    }

    ctx.session[ctx.update.message.chat.id] = {
        created_at: ctx.update.message.date,
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

    return true;
}

function updateSessions(ctx, logger) {
    ctx.session[ctx.update.message.chat.id].updated_at = (new Date()).getTime();
    storeSessions(ctx.session, logger);
}

function setCurrentMood(ctx, currentMood, logger) {
    ctx.session[ctx.update.message.chat.id].settings.currentMood = currentMood;
}

function getCurrentMood(ctx) {
    return ctx.session[ctx.update.message.chat.id].settings.currentMood;
}

function setCurrentMessage(ctx, currentMessage, logger) {
    ctx.session[ctx.update.message.chat.id].settings.currentMessage = currentMessage;
}

function getCurrentMessage(ctx) {
    return ctx.session[ctx.update.message.chat.id].settings.currentMessage;
}

function setAmountOfMessages(ctx, amountOfMessages, logger) {
    ctx.session[ctx.update.message.chat.id].settings.amountOfMessages = amountOfMessages;
}

function getAmountOfMessages(ctx) {
    return ctx.session[ctx.update.message.chat.id].settings.amountOfMessages;
}

function setSilenceForAmountOfMessages(ctx, silenceForAmountOfMessages, logger) {
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
    getSessions,
    storeSessions,
    startNewSession,
    updateSessions,
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