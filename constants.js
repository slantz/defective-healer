"use strict";

const SLAVIK_COORDS = {
    lat: 55.739816,
    long: 37.627272
};

/**
 * Please see https://core.telegram.org/bots/api#message.
 * @type {{STRING}}
 */
const BOT_EVENTS = {
    TEXT:               "text",
    AUDIO:              "audio",
    DOCUMENT:           "document",
    GAME:               "game",
    PHOTO:              "photo",
    STICKER:            "sticker",
    VIDEO:              "video",
    VOICE:              "voice",
    VIDEO_NOTE:         "video_note",
    CAPTION:            "caption",
    CONTACT:            "contact",
    LOCATION:           "location",
    VENUE:              "venue",
    NEW_CHAT_PHOTO:     "new_chat_photo",
    NEW_CHAT_TITLE:     "new_chat_title",
    NEW_CHAT_MEMBERS:   "new_chat_members",
    LEFT_CHAT_MEMBER:   "left_chat_member"
};

const MESSAGE_TYPES = {
    ENTITIES: {
        BOT_ENTITIES_TYPE_MENTION: "mention",
        TEXT_MENTION: "text_mention"
    }
};

const REGEXPS = {
    HI: /прив(ет|а\s)|даров|йо\s|в(о|а)сап{1,2}|как\sоно|как\sдел|здравствуйт|кто\sздес|что\sделае(ш|т)/i,
    FIND: /вычислим/i,
    APPEAL: /(?!(славик_запиши|славик_дела|славик_напомни))(славик|слав|святослав|викторович|блинков|пранкер|дефектив|целител|slav|victorov|healer|defective|сяв|врач|доктор|святик)/i,
    RICH_BITCH: /\$|\£|\£|\¥|\€|\₽|\₴|деньг|лав(е|э)|мани|money|dollar|bucks|дол{1,2}ар|евро|гривн|копейк|цент.{1,2}|грн|дело|бизнес/i,
    SINGING: /петь|певиц|поё(т|м)|песн|по(й|ю)|спел/i,
    TEA_TIME: /чай|к(о|а)ф{1,2}е|пить|чаепити|перекур|перерыв|обед|ланч|ужин|завтрак/i,
    GANG: /банд|шайк|лейк.{1,2}|ушат/i,
    VASYA: /васили|вас(я|ю|е)/i,
    ID_FIRST_LAST_NAME_FROM_LOGS: /"from"(\s+)?:(\s+)?\{(\s+)?"id"(\s+)?:(\s+)?([\w\-]+),(\s+)?"is_bot":(\s+)?(true|false),(\s+)?"first_name"(\s+)?:(\s+)?"([^"]+)"(,"last_name"(\s+)?:(\s+)?"([^"]+)")?/i
};

const STICKER_IDS = {
    EXTINGUISHER: 'CAADAgADfwAD8MPADvKH6ih2RMD9Ag',
    BUSINESS_LESSON: 'CAADAgADJAADauwzB5lEyGNQWVTJAg'
};

const HASHTAGS = {
    MEMORIZE: 'славик_запиши',
    REMIND: 'славик_напомни',
    DIDS: 'славик_дела'
};

const FILES = {
    QUOTES: "quotes.json",
    SESSIONS: "sessions.json",
    LOGS: {
        ERROR: "logs/dh-error.log",
        INFO: "logs/dh-info.log",
        WARN: "logs/dh-warn.log"
    }
};

const CODES = {
    ERRORS: {
        SESSIONS_WRITE_ERROR: "SESSIONS_WRITE_ERROR",
        NO_SESSIONS_FILE_EXIST: "NO_SESSIONS_FILE_EXIST",
        CREATE_NEW_FILE_FAILED: "CREATE_NEW_FILE_FAILED",
        READ_FILE_FAILED: "READ_FILE_FAILED"
    },
    SUCCESS: {
        SESSIONS_WRITE_SUCCESS: "SESSIONS_WRITE_SUCCESS"
    }
};

const TROLL_TIME = {
    HOURS_RANGE: {
        MIN: 21,
        MAX: 23
    },
    MINUTES_RANGE: {
        MIN: 0,
        MAX: 57
    }
};

module.exports = {
    SLAVIK_COORDS,
    BOT_EVENTS,
    MESSAGE_TYPES,
    REGEXPS,
    STICKER_IDS,
    HASHTAGS,
    FILES,
    CODES,
    TROLL_TIME
};