const Discord = require('discord.js');
const fs = require('fs');
const colors = require('colors/safe');

const Settings = require('../settings.json');
const EmbedTemplates = require('../utils/embed-templates');

/**@type {RegExp[]} */
let RegExpWords = [ 
    /(?:(?:f+\s*)+(?:a+\s*)+(?:s+\s*)+z+)(?!állító)/gim,
    /(?:(?:s+\s*)+(?:e+\s*)+(?:g+\s*)+g+)/gim
];
GetRegExpWords();

/**
 * e.g.: fasz => /\b((?:f+\s*)+(?:a+\s*)+(?:s+\s*)+z+)\b/gim
 * ***
 * * \s whitespace
 * * (?: ) non capturing group
 * * ( ) capturing group
 * * \+ 1 or more
 * * \* 0 or more
*/
const regexpTemplates = {
    StartAndMindle: "(?:#+\\s*)+",
    End: "#+"
};

module.exports = {
    /** 
     * @param {Discord.Message} message 
     * @returns {Boolean} If the message got deleted true, otherwise false.
     */
    Check: function(message) {
        let found = false;
        for(const regexp of RegExpWords) {
            let matches = message.content.match(regexp);
            if(matches != null && matches.length > 0) {
                found = true;
                break;
            }
        }
        if(found) {
            /** @type {Discord.TextChannel} */
            let logChannel = message.client.channels.resolve(Settings.Channels.automodLogId);

            let reason = "Fekete listán levő szavak használata.";
            let logEmbed = EmbedTemplates.LogMsgDelete(message, reason);
            logChannel.send({embed: logEmbed});

            message.channel.send(`**${message.member}, üzeneted törölve lett az automod által, mert fekete listán levő szavakat használtál.**`);

            if(message.deletable) message.delete({reason: reason});
            return true;
        }
        return false;
    }
}

/** This function imports words from jsons and converting them to regular expresstions. */
function GetRegExpWords() {
    let dir = "blacklisted/words";
    
    fs.readdir(`./sec-sys/${dir}/`, (err, files) => {
        if(err) console.error(`ERROR: ${err}`);

        let jsonfiles = files.filter(f => f.split(".").pop() === "json");
        if(jsonfiles.length <= 0) {
            console.log(colors.red("ERROR: No jsons to load!"));
            return;
        }

        console.log(colors.cyan(`Loading ${jsonfiles.length} jsons! (sec-sys/${dir})`));

        jsonfiles.forEach((f, i) => {
            delete require.cache[require.resolve(`./${dir}/${f}`)];
            /** @type {string[]} */
            let json = require(`./${dir}/${f}`);
            for(const word of json) {
                let pattern = "\\b";
                for (let index = 0; index < word.length; index++) {
                    const char = word[index];
                    if(index == word.length - 1) pattern += regexpTemplates.End.replace('#', char);
                    else pattern += regexpTemplates.StartAndMindle.replace('#', char);
                }
                pattern += "\\b";
                RegExpWords.push(new RegExp(pattern, "gim"));
            }
            console.log(colors.white(`${f} loaded! Words: ${json.length}`));
        });

        console.log(colors.cyan(`Successfully loaded ${jsonfiles.length} jsons!\n`));
    });
}