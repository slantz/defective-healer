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

module.exports = {
    SLAVIK_COORDS,
    BOT_EVENTS,
    MESSAGE_TYPES
};