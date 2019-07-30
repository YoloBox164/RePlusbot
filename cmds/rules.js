const Discord = module.require('discord.js');

module.exports.run = (bot, message, args) => {
    var embed = new Discord.RichEmbed()
        .setTitle(":wave: **Üdvözöllek a szerveren!**")
        .setDescription(`__**Itt olvashatsz a szerverről és a hozzá tartozó szabályokról!**__

            :large_blue_circle: A szerver témája kötetlen beszélgethetsz arról amiről szeretnél legyen az sport, videójátékok vagy valami hétköznapibb. Ne félj egy új témát nyitni ha nincs mozgás a chaten vagy ha van csatlakozz be nyugodtan.

            :large_blue_circle: A szerver igyekszik felzárkózott maradni a fejlesztésekkel és frissítésekkel mind a Discord és az egyéb programok, oldalak terén. A közösséget pedig kisebb-nagyobb sorsolásokkal, közös játékestekkel és beszélgetésekkel próbáljuk mégjobban összekovácsolni.

            :large_blue_circle: A szerveren a segítségkérési lehetőség a nap minden órájában elérhető. Ha segítségre szorulsz vagy hibát észleltél ne félj megjelölni egy személyzeti tagot. 

            :large_blue_circle: A szerver személyzete igyekszik a minnél nyugodtabb és csendesebb légkör elérésében. Esetleges rendbontás esetén vagy ha segítségre szorulsz rendelkezésedre állnak.

            :large_blue_circle: A szerver egyes tagjai kiemeltek megbízhatóságuk miatt. Ha esetleg Steam tárgycserét vagy valamilyen csereajánlatot szeretnél létrehozni bennük nyugodtan megbízhatsz.

            (A szerver a **Discordapp** szabályzatát és végfelhasználói licenszszerződését veszi moderációs alapjául. Amennyiben nem ismered vagy nem emlékszel rá a csatolmányokban megtalálod a szabályzat alatt)

            __**Szerver meghívólinkje:**__
            **https://discord.gg/7sd2qkt**

            __**Discordapp végfelhasználói szerződései:**__
            **https://discordapp.com/terms**
            **https://discordapp.com/guidelines**
            **https://discordapp.com/privacy**`)
        .setColor("#7489DA")
        .setThumbnail("https://cdn.discordapp.com/attachments/538075658069344276/605075123908902921/wump.png");

    message.channel.send({embed: embed});
}

module.exports.help = {
    cmd: "rules",
    name: "Rules"
}