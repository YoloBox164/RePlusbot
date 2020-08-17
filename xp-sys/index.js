const Databse = require("../database");
const { MessageAttachment } = require("discord.js");
const { Collection } = require("discord.js");

const maxExpPerMsg = 5;
const minExpPerMsg = 1;

const randomExp = () => { return Math.floor(Math.random() * maxExpPerMsg) + minExpPerMsg; };

const cooldown = new Collection();

module.exports = {

    GetCanvas: require("./canvas"),

    /**
     * @param {import("discord.js").Message} message
     * @param {boolean} isCommandTrue
     */
    GiveExp(message, isCommandTrue) {
        Databse.GetData("Users", message.author.id).then(async userData => {
            if(!userData) {
                userData = {
                    id: message.author.id,
                    tag: message.author.tag,
                    messages: 1,
                    commandUses: 0,
                    level: 1,
                    exp: randomExp()
                };
            } else {
                userData.messages += 1;
                if(isCommandTrue) userData.commandUses += 1;

                if(!cooldown.has(userData.id)) {
                    userData.exp = userData.exp + randomExp();
                    const { level } = this.GetLevel(userData.exp);
                    if(level > userData.level) {
                        userData.level = level;
                        const attach = new MessageAttachment(await this.GetCanvas(userData, message.member), "exp.png");
                        message.channel.send(`Gratulálok ${message.member}, szintet léptél!`, attach);
                    }
                }
            }

            Databse.SetData("Users", userData);
            cooldown.set(userData.id, setTimeout(() => cooldown.delete(userData.id)), 60000); // 1 mins
        }).catch(console.error);
    },

    GetLevel: require("./getLevel")
};