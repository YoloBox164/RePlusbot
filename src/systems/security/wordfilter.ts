import fs from "fs";
import colors from "colors/safe";
import Settings from "../../settings.json";
import EmbedTemplates from "../../utils/embed-templates";
import { Message, TextChannel } from "discord.js";

const RegExpWords: RegExp[] = [
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

/**
 * @returns If the message got deleted true, otherwise false.
 */
export function Check(message: Message): boolean {
   let found = false;
   for(const regexp of RegExpWords) {
       const matches = message.content.match(regexp);
       if(matches != null && matches.length > 0) {
           found = true;
           break;
       }
   }
   if(found) {
       const logChannel = <TextChannel>message.client.channels.resolve(Settings.Channels.automodLogId);

       const reason = "Fekete listán levő szavak használata.";
       const logEmbed = EmbedTemplates.MsgDelete(message, reason);
       logChannel.send({ embed: logEmbed });

       message.channel.send(`**${message.member}, üzeneted törölve lett az automod által, mert fekete listán levő szavakat használtál.**`);

       if(message.deletable) message.delete({ reason: reason });
       return true;
   }
   return false;
}

export default {
    Check
}

/** This function imports words from jsons and converting them to regular expresstions. */
function GetRegExpWords() {
    const dir = "blacklisted/words";

    fs.readdir(`./dist/systems/security/${dir}/`, (err, files) => {
        if(err) console.error(`ERROR: ${err}`);

        const wordFiles = files.filter(f => f.split(".").pop() === "js");
        if(wordFiles.length <= 0) {
            console.log(colors.red("ERROR: No word files to load!"));
            return;
        }

        console.log(colors.cyan(`Loading ${wordFiles.length} word files! (security/${dir})`));

        wordFiles.forEach((f) => {
            delete require.cache[require.resolve(`./${dir}/${f}`)];
            const words: string[] = require(`./${dir}/${f}`).default;
            for(const word of words) {
                let pattern = "\\b";
                for (let index = 0; index < word.length; index++) {
                    const char = word[index];
                    if(index == word.length - 1) pattern += regexpTemplates.End.replace("#", char);
                    else pattern += regexpTemplates.StartAndMindle.replace("#", char);
                }
                pattern += "\\b";
                RegExpWords.push(new RegExp(pattern, "gim"));
            }
            console.log(colors.white(`${f} loaded! Words: ${words.length}`));
        });

        console.log(colors.cyan(`Successfully loaded ${wordFiles.length} word files!\n`));
    });
}