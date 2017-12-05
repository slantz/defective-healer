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

module.exports = {
    convertPeopleToTroll,
    getFullUncutQuotes,
    randomIntFromInterval,
    silenceForAmountOfMessages,
    getSkipMessagesMatch,
    getMood,
    getCurrentMoodDescription
};