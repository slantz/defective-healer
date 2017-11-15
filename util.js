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

    QUOTES_CUT.COMMON.DEFECTIVE_HEALING =
        JSON.parse(fs.readFileSync(join(__dirname, QUOTES_CUT.COMMON.DEFECTIVE_HEALING)));

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

module.exports = {
    convertPeopleToTroll,
    getFullUncutQuotes,
    randomIntFromInterval,
    getSkipMessagesMatch
};