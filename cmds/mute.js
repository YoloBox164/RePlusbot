const fs = require('fs');
const convert = require('convert-units');
const Discord = require('discord.js');
const Functions = require('../functions.js');
const SETTINGS = require('../settings.json');

const MUTES = require('../mute.json');

const timeHelpCollection = new Discord.Collection();
timeHelpCollection.set('y', {
    name: 'year',
    singluar: 'Year',
    pluar: 'Years'

});
timeHelpCollection.set('mh', {
    name: 'month',
    singluar: 'Month',
    pluar: 'Months'
});
timeHelpCollection.set('w', {
    name: 'week',
    singluar: 'Week',
    pluar: 'Weeks'
});
timeHelpCollection.set('d', {
    name: 'd',
    singluar: 'Day',
    pluar: 'Days'
});
timeHelpCollection.set('h', {
    name: 'h',
    singluar: 'Hour',
    pluar: 'Hours'
});
timeHelpCollection.set('m', {
    name: 'min',
    singluar: 'Minute',
    pluar: 'Minutes'
});
timeHelpCollection.set('s', {
    name: 's',
    singluar: 'Second',
    pluar: 'Seconds'
});

module.exports.run = async (bot, message, args) => {
    if(Functions.MemberHasRoles(message.member, SETTINGS.StaffIds) && !message.member.hasPermission("MUTE_MEMBERS") && message.author.id !== bot.devId) {
        message.channel.send("You do not have the permission for this command!");
        return;
    }

    var target = Functions.GetMember(message, args);
    if(!target || target.id === message.author.id) {
        message.channel.send("User not found or it was not given. Help: \`" + this.help.usage + "\`")
    }

    if(target.highestRole.position >= message.member.highestRole.position) {
        message.channel.send("You cannot mute a member who is higher or has the same role as you!");
        return;
    }
    if(target.highestRole.position >= message.guild.members.get(bot.user.id).highestRole.position) {
        message.channel.send("The Member has a higher role or the same as mine, cannot mute!");
        return;
    }

    var muteRole = await message.guild.roles.get(SETTINGS.MuteRoleId);
    if(!muteRole) {
        muteRole = await message.guild.createRole({
            name: "Némitott",
            color: "#A5A4A4",
            hoist: true,
            position: 0,
            permissions: [],
            mentionable: true
        }).catch(console.error);

        SETTINGS.MuteRoleId = muteRole.id;

        message.guild.channels.forEach(async (channel, id) => {
            await channel.overwritePermissions(muteRole, {
                SEND_MESSAGES: false,
                ADD_REACTIONS: false,
                ATTACH_FILES: false,
                CONNECT: false,
                SPEAK: false
            }).catch(console.error);
        });
    } else {
        message.guild.channels.forEach(async (channel, id) => {
            await channel.overwritePermissions(muteRole, {
                SEND_MESSAGES: false,
                ADD_REACTIONS: false,
                ATTACH_FILES: false,
                CONNECT: false,
                SPEAK: false
            }).catch(console.error);
        });
    }

    fs.writeFile("./settings.json", JSON.stringify(SETTINGS, null, 4), err => { if(err) throw err; });
    muteRole.setPosition(message.guild.members.get(bot.user.id).highestRole.position - 1);

    if(target.roles.has(muteRole.id)) return message.channel.send(`${target.displayName} is alredy muted!`);

    var muteTime;
    var time = {
        amount: args[1],
        type: args[2]
    };
    if(!isNaN(time.amount)) {
        if(!time.type) {
            message.channel.send(`\`ERROR\` Time type is missing. Help: \`${this.help.usage}\``).then(msg => {
                if(message.deletable) message.delete(20000).catch(console.error);
                if(msg.deletable) msg.delete(20000).catch(console.error);
            });
            return;
        } 
        var unit = timeHelpCollection.get(time.type.toLowerCase());
        if(unit) {
            muteTime = Date.now() + convert(time.amount).from(`${unit.name}`).to('ms'); 
        } else {
            message.channel.send(`\`ERROR\` Wrong time formatum. Help: \`${this.help.desc}\`\n${this.help.usage}`).then(msg => {
                if(message.deletable) message.delete(20000).catch(console.error);
                if(msg.deletable) msg.delete(20000).catch(console.error);
            });
            return;
        }
    } else muteTime = Date.now() * 1000;

    await target.addRole(muteRole).catch(console.error);

    MUTES[`${target.id}`] = {
        id:  `${target.id}`,
        time: muteTime
    }

    fs.writeFile("./mute.json", JSON.stringify(MUTES, null, 4), err => {
        if(err) throw err;
        var aboutIn = convert(Math.abs(muteTime - Date.now())).from('ms').toBest();
        var unit = timeHelpCollection.find(v => v.name == aboutIn.unit)
        if(unit) {
            if(aboutIn.unit == 's' && aboutIn.val > 1 && aboutIn.val < 10) {
                aboutIn.unit = "Second"
            } else if(aboutIn.val > 1) {
                aboutIn.unit = unit.pluar;
            } else {
                aboutIn.unit = unit.singluar;
            }
        }
        message.channel.send(`I've muted ${target.displayName}, going to be unmuted at: ${bot.logDate(muteTime)}! (About in: ${Functions.RoundNumber(aboutIn.val, 2)} ${aboutIn.unit})`);
    });
}

module.exports.help = {
    cmd: "mute",
    alias: ["nemit", "némit"],
    name: "Mute",
    desc:
        `Voice and Text mute a user.
        
        Valid time formations: 
            \`s => seconds\`
            \`m => minute\`
            \`h => hour\`
            \`d => day\`
            \`w => week\`
            \`mh => month\`
            \`y => year\`
        If time was not given then it will be permament.`,
    usage: ">mute [username / mention / id] <time> <time type>",
    category: "moderator"

}