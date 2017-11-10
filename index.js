'use strict';

require('dotenv').config();

var fs = require('fs');
var path = require('path');
var join = require('path').join;

var express = require('express');
var app = express();

const Telegraf = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);

const port = Number(process.env.PORT || 3001);



// bot.startWebhook('/secret-path', null, 5000)

// expressApp.use(bot.webhookCallback('/secret-path'))
// bot.setWebhook('https://server.tld:8443/secret-path')

// TODO move this to some authorization middleware module
// var userTypes = {
//     any: function(types) {
//         return function(req, res, next) {
//             if (req.isAuthenticated()) {
//                 let admin = types.indexOf(Number(req.user.typeId)) !== -1;
//                 res.json({
//                     _id : req.user._id,
//                     typeId : req.user.typeId,
//                     provider : req.user.provider,
//                     username : req.user.username,
//                     name : req.user.name,
//                     admin
//                 });
//             } else {
//                 res.status(401).json({ error: Error('unauthorized') });
//             }
//         }
//     }
// };

// app.get('/auth/user/me', userTypes.any(AdminUserIdTypes));


// app.listen(port ,function() {
//     console.log('server running at localhost:' + port + ', go refresh and see magic');
// });

bot.startPolling();

bot.context.db = {
    getScores: () => { return 42 },
    getLol: (username) => {
        if (username !== "kblnsk") {
            return null;
        }

        return "алина певитса @ гмейл ком";
    },
    getHello: () => { return "Меня Святослав Викторович зовут."; }
};

bot.start((ctx) => {
    console.log('started:', ctx.from.id);
    return ctx.reply('ты почему сюда звонишь? я разрешал тебе сюда звонить?');
})

/**
 * ORDER MATTERS:
 * 1. first commands
 * 2. regexps
 * 3. then on all tet if nothing is found
 */
bot.hears(/привет/i, (ctx) => {
    return ctx.reply(ctx.db.getHello());
});

bot.command('/foo', (ctx) => ctx.reply('Hello World'));

bot.on('text', (ctx) => {
    console.log(ctx.message.from);
    const score = ctx.db.getLol(ctx.message.from.username)
    if (score) {
        return ctx.reply(`${ctx.message.from.username}: ${score}`)
    }
});

bot.catch((err) => {
    console.log('Ooops', err)
});

