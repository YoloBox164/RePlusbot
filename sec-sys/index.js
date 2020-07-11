const wordfilter = require('./wordfilter');
const linkfilter = require('./linkfilter');
const regist = require('./regist');

module.exports = {
    Regist: {
        CheckReaction: regist.CheckReaction,
        CheckMsg: regist.CheckMsg
    },
    Automod: {
        WordFilter: wordfilter,
        LinkFilter: linkfilter
    }
}
