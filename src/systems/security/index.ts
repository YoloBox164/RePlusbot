import WordFilter from "./wordfilter";
import LinkFilter from "./linkfilter";
import SpamProtection from "./spam-protection";
import MuteHandler from "./mute-handler";
import Regist from "./regist";

export default {
    Regist,
    Automod: {
        WordFilter,
        LinkFilter,
        SpamProtection
    },
    MuteHandler
}

export { WordFilter }
export { LinkFilter }
export { SpamProtection }
export { MuteHandler }
export { Regist }