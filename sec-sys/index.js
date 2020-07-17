const wordfilter = require('./wordfilter');
const linkfilter = require('./linkfilter');
const spamProtection = require('./spam-protection');
const muteHandler = require('./mute-handler');
const regist = require('./regist');

module.exports = {
    Regist: {
        CheckReaction: regist.CheckReaction,
        CheckMsg: regist.CheckMsg
    },
    Automod: {
        WordFilter: wordfilter,
        LinkFilter: linkfilter,
        SpamProtection: spamProtection
    },
    MuteHandler: muteHandler
}
