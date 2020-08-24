const Databse = require("../database");
const { MessageAttachment, Collection } = require("discord.js");

const maxExpPerMsg = 5;
const minExpPerMsg = 1;

/** 2 minutes */
const cooldownTime = 120000;

/** @type {import("discord.js").Collection<string, {timeout: NodeJS.Timeout}} */
const cooldowns = new Collection();

const randomExp = () => { return Math.floor(Math.random() * maxExpPerMsg) + minExpPerMsg; };

module.exports = {

    GetCanvas: require("./canvas"),

    /**
     * @param {import("discord.js").Message} message
     * @param {boolean} isCommandTrue
     */
    GiveExp(message, isCommandTrue) {
        const cooldownData = cooldowns.get(message.author.id);
        Databse.GetData("Users", message.author.id).then(async userData => {
            if(cooldownData) return;
            let messages = 1;
            let commandUses = 0;
            let userLevel = 1;
            let exp = randomExp();

            if(userData) {
                messages += userData.messages;
                commandUses = userData.commandUses;
                userLevel = userData.level;
                exp += userData.exp;
            }

            if(isCommandTrue) commandUses++;

            const { level } = this.GetLevel(userData.exp);
            if(level > userLevel) {
                userLevel = level;
                const attach = new MessageAttachment(await this.GetCanvas(userData, message.member), "exp.png");
                message.channel.send(`Gratulálok ${message.member}, szintet léptél!`, attach);
            } else if(level < userLevel) {
                userLevel = level;
                const attach = new MessageAttachment(await this.GetCanvas(userData, message.member), "exp.png");
                message.channel.send(`Jaj nee ${message.member}, szintet veszítettél!`, attach);
            }

            Databse.SetData("Users", {
                id: message.author.id,
                tag: message.author.tag,
                messages: messages,
                commandUses: commandUses,
                level: userLevel,
                exp: exp
            }).then(() => {
                cooldowns.set(message.author.id, {
                    timeout: setTimeout(() => cooldowns.delete(message.author.id), cooldownTime)
                });
            }).catch(console.error);
        }).catch(console.error);
    },

    GetLevel: require("./getLevel")
};