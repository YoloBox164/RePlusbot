const wordfilter = require('./wordfilter');
const regist = require('./regist');

module.exports = {
    Regist: {
        CheckReaction: regist.CheckReaction,
        CheckMsg: regist.CheckMsg
    },
    Automod: {
        WordFilterCheck: wordfilter.Check
    }
}
