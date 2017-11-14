"use strict";

function convertPeopleToTroll(PEOPLE_TO_TROLL) {
    function getMatchedPerson(next) {
        return next.match(/(\d+)\[(\w+)\]/i);
    }

    return PEOPLE_TO_TROLL
        .split(",")
        .reduce((prev, next) =>
                Object.assign(prev, {
                    [Number(getMatchedPerson(next)[1])]: {
                        id : Number(getMatchedPerson(next)[1]),
                        name : getMatchedPerson(next)[2]
                    }
                })
        , {}) || {};
}

module.exports = {
    convertPeopleToTroll
};