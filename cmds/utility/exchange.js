const Discord = require("discord.js");
const got = require("got");
const api = "06b26c42ff1b069252795e80";

module.exports = {
    /**
     * @param {import("discord.js").Message} message Discord message.
     * @param {Array<string>} args The message.content in an array without the command.
     */
    execute: async (message, args) => {
        const isoCurrMap = await got("http://www.localeplanet.com/api/auto/currencymap.json", { json: true });

        const val = isNaN(args[0]) ? 1 : args[0];
        let fr, to;

        if(isNaN(args[0])) {
            if(args[0]) fr = args[0].toUpperCase();
            if(args[1]) to = args[1].toUpperCase();
        } else {
            if(args[1]) fr = args[1].toUpperCase();
            if(args[2]) to = args[2].toUpperCase();
        }

        if(!fr) fr = "EUR";
        if(!to) to = "HUF";

        const symbol = isoCurrMap.body[to].symbol_native;

        const res = await got(`https://v3.exchangerate-api.com/pair/${api}/${fr}/${to}`, { json: true });
        if(res.body.result == "failed") return message.channel.send(res.body.error);
        const msg = await message.channel.send("Átváltás...");
        const embed = new Discord.MessageEmbed()
            .setThumbnail("https://www.exchangerate-api.com/img/logo-square.png")
            .setTitle(`${fr} => ${to}`)
            .setAuthor(message.author.tag, message.author.displayAvatarURL())
            .setColor(message.guild.member(message.client.user).displayHexColor)
            .addField("Eredmény", `${res.body.rate * val} ${symbol}`);
        await message.channel.send({ embed: embed });
        msg.delete();
    },
    args: true,
    name: "exchange",
    alias: ["change", "currency", "ex"],
    desc: "Valuta átváltó | használd ISO 4217 valuta kódokat (pl.: HUF, EUR, USD, stb.)",
    usage: ">exchange <érték> <valutaból> <másik valutába>"
};