'use strict';

require('dotenv').config();

var fs = require('fs');
var path = require('path');
var join = require('path').join;

var express = require('express');
var app = express();

const Telegraf = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.catch((err) => {
    console.log('Ooops', err)
})

// TODO move this to some authorization middleware module
var userTypes = {
    any: function(types) {
        return function(req, res, next) {
            if (req.isAuthenticated()) {
                let admin = types.indexOf(Number(req.user.typeId)) !== -1;
                res.json({
                    _id : req.user._id,
                    typeId : req.user.typeId,
                    provider : req.user.provider,
                    username : req.user.username,
                    name : req.user.name,
                    admin
                });
            } else {
                res.status(401).json({ error: Error('unauthorized') });
            }
        }
    }
};

app.get('/auth/user/me', userTypes.any(AdminUserIdTypes));

var port = Number(process.env.PORT || 3001);

app.listen(port ,function() {
    console.log('server running at localhost:' + port + ', go refresh and see magic');
});