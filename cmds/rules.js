const Discord = require('discord.js');

module.exports.run = (bot, message, args) => {
    var embed = new Discord.RichEmbed()
        .setTitle("**Üdvözöllek a Discord Közösség Szerverén!**")
        .setDescription(`__**Itt olvashatsz a szerverről és a hozzá tartozó szabályokról!**__
        
        :small_blue_diamond: A szerver témája kötetlen, beszélgethetsz bármiről legyen az sport, videójátékok vagy bármi hétköznapi akár az időjárás.
        
        :small_blue_diamond: A szerver igyekszik felzárkózott maradni a fejlesztésekkel és frissítésekkel mind a Discord és az egyéb programok, oldalak terén. A közösséget pedig kisebb-nagyobb sorsolásokkal, közös játékestekkel és beszélgetésekkel próbáljuk mégjobban összekovácsolni.
        
        :small_blue_diamond: A szerveren bármikor kérhetsz segítséget másoktól és a személyzettől is. Ha esetleg hibát észlelsz esetleg nem értesz valamit nyugodtan jelölj meg egy személyzeti tagot vagy a tulajdonost.
        
        __**Fontos információk:**__
        A szerver a Discordapp végfelhasználói (licensz)szerződésire építi szabályzatát és moderációs alapját, melyet megtalálsz lentebb. Ezen szabályok nem ismerése, nem mentesít fel téged semmilyen szituációban.
        
        __**Discordapp végfelhasználói szerződések**__
        **https://discordapp.com/terms**
        **https://discordapp.com/guidelines**
        **https://discordapp.com/privacy**
        
        __**Szerverünk meghívólinkje:**__
        **https://discord.gg/7sd2qkt**`)
        .setColor("#7489DA")
        .setThumbnail("https://cdn.discordapp.com/attachments/538075658069344276/605075123908902921/wump.png");

    message.channel.send({embed: embed});
}

module.exports.help = {
    cmd: "rules",
    name: "Rules"
}