const Discord = require('discord.js');

module.exports = {
    /**
     * @param {Array} array The array that will be used
     * @param {any} valueName The name of the value that we are searching
     * @returns The values that it found under the specified name
     */
    GetObjectValueFromArray: function (array, valueName) {
        var values = [];
        for(let i = 0; i < array.length; i++) {
            values.push(array[i][`${valueName}`]);
        }
        return values;
    },

    /**
     * @param {Discord.Message} message discord message
     * @param {Array<string>} args message.content in an array without the command
     * @returns {Discord.GuildMember} a discord guild member
     */
    GetMember: function(message, args) {
        if(!args[0]) args = [];
        var joinedArgs = args.join(" ").toLowerCase();
        var target = message.guild.member(message.mentions.users.first())
            || message.guild.members.find(member => joinedArgs.includes(member.displayName.toLowerCase()) || joinedArgs.includes(member.user.username))
            || message.guild.members.get(args[0])
            || message.member;
        return target; //give back a guildmember
    },
    /**
     * @param {Array} array
     * @param {any} key
     * @returns The sorted array.
     */
    SortByKey: function(array, key) {
        return array.sort(function(a, b) {
            var x = a[key]; var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    },

    /**
     * @description Checks if the member has at least one of the roles.
     * @param {Discord.GuildMember} member Discord guild member.
     * @param {Array<string>} roleIds Array field with role ids.
     * @returns True or false
     */

    MemberHasOneOfTheRoles: function(member, roleIds) {
        roleIds.forEach(roleId => {
            if(member.roles.get(roleId)) return true;
        }); return false;
    },

    /**
     * @typedef {Object} MonthDateRange
     * @property {number} start first day of the month in milliseconds
     * @property {number} end last day of the month in milliseconds
     */

    /**
     * @param {number} year which year is it
     * @param {number} month which month is it
     * @returns {MonthDateRange} The first and last day of the month in milliseconds
     */

    GetMonthDateRange: function(year, month) {
        var moment = require('moment');
        
        var startDate = moment([year, month]);
        var endDate = moment(startDate).endOf('month');
    
        return { start: Date.parse(startDate), end: Date.parse(endDate) };
    },

    /**
     * @param {number} milliseconds
     * @returns {string} hours:minutes:seconds - e.g.: 01:14:54
     */

    ParseMillisecondsIntoReadableTime: function(milliseconds){
        //Get hours from milliseconds
        var hours = milliseconds / (1000*60*60);
        var absoluteHours = Math.floor(hours);
        var h = absoluteHours > 9 ? absoluteHours : '0' + absoluteHours;

        //Get remainder from hours and convert to minutes
        var minutes = (hours - absoluteHours) * 60;
        var absoluteMinutes = Math.floor(minutes);
        var m = absoluteMinutes > 9 ? absoluteMinutes : '0' +  absoluteMinutes;

        //Get remainder from minutes and convert to seconds
        var seconds = (minutes - absoluteMinutes) * 60;
        var absoluteSeconds = Math.floor(seconds);
        var s = absoluteSeconds > 9 ? absoluteSeconds : '0' + absoluteSeconds;

        return h + ':' + m + ':' + s;
    },

    /**
     * @param {number} num Number to be rounded
     * @param {number} scale 
     * @returns {number} Rouned number
     */

    RoundNumber: function(num, scale) {
        if(!("" + num).includes("e")) {
            return +(Math.round(num + "e+" + scale)  + "e-" + scale);
        } else {
            var arr = ("" + num).split("e");
            var sig = ""
            if(+arr[1] + scale > 0) {
                sig = "+";
            }
            return +(Math.round(+arr[0] + "e" + sig + (+arr[1] + scale)) + "e-" + scale);
        }
    },

    /**
     * @param {string} string
     * @returns {string}
     */
    
    FirstCharUpperCase: function(string) {
        return string[0].toUpperCase() + string.slice(1);
    }
}