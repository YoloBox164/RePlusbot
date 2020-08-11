module.exports = {
    /**
     * @param {Array} array The array that will be used
     * @param {any} valueName The name of the value that we are searching
     * @returns The values that it found under the specified name
     */
    GetObjectValueFromArray: function(array, valueName) {
        const values = [];
        for(let i = 0; i < array.length; i++) {
            values.push(array[i][`${valueName}`]);
        }
        return values;
    },

    /**
     * @param {import("discord.js").Message} message discord message
     * @param {?Array<string>} [args=[]] message.content in an array without the command
     * @param {?boolean} [me=true] If is this true and everyother option fails its going to return the message.member as a target.
     * @returns {(import("discord.js").GuildMember|null)} a discord guild member or nothing if me is false and everyother options fails
     */
    GetMember: function(message, args, me) {
        if(!args[0]) args = [];
        if(me == null) me = true;
        const joinedArgs = args.join(" ").toLowerCase();
        let target = message.mentions.members.first() || message.guild.members.resolve(args[0]);
        if(!target) {
            target = message.guild.members.cache.find(m => joinedArgs == m.user.tag.toLowerCase()
            || joinedArgs == m.user.username.toLowerCase()
            || joinedArgs == m.displayName.toLowerCase()
            );
        }
        if(!target) {
            target = message.guild.members.cache.find(m => joinedArgs.includes(m.user.tag.toLowerCase())
            || joinedArgs.includes(m.user.username.toLowerCase())
            || joinedArgs.includes(m.displayName.toLowerCase())
            );
        }
        if(!target && me) target = message.member;
        return target; // give back a guildmember
    },
    /**
     * @param {Array} array
     * @param {any} key
     * @returns The sorted array.
     */
    SortByKey: function(array, key) {
        return array.sort(function(a, b) {
            const x = a[key]; const y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    },

    /**
     * @description Checks if the member has at least one of the roles.
     * @param {import("discord.js").GuildMember} member Discord guild member.
     * @param {Array<string>} roleIds Array field with role ids.
     * @returns True or false
     */

    MemberHasOneOfTheRoles: function(member, roleIds) {
        let bool = false;
        roleIds.forEach(roleId => {
            if(member.roles.cache.get(roleId)) bool = true;
        });
        return bool;
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
        const moment = require("moment");

        const startDate = moment([year, month]);
        const endDate = moment(startDate).endOf("month");

        return { start: Date.parse(startDate), end: Date.parse(endDate) };
    },

    /**
     * @param {number} milliseconds
     * @returns {string} hours:minutes:seconds - e.g.: 01:14:54
     */

    ParseMillisecondsIntoReadableTime: function(milliseconds) {
        // Get hours from milliseconds
        const hours = milliseconds / (1000 * 60 * 60);
        const absoluteHours = Math.floor(hours);
        const h = absoluteHours > 9 ? absoluteHours : "0" + absoluteHours;

        // Get remainder from hours and convert to minutes
        const minutes = (hours - absoluteHours) * 60;
        const absoluteMinutes = Math.floor(minutes);
        const m = absoluteMinutes > 9 ? absoluteMinutes : "0" + absoluteMinutes;

        // Get remainder from minutes and convert to seconds
        const seconds = (minutes - absoluteMinutes) * 60;
        const absoluteSeconds = Math.floor(seconds);
        const s = absoluteSeconds > 9 ? absoluteSeconds : "0" + absoluteSeconds;

        return `${h}:${m}:${s}`;
    },

    /**
     * @param {number} num Number to be rounded
     * @param {number} scale
     * @returns {number} Rouned number
     */

    RoundNumber: function(num, scale) {
        if(!("" + num).includes("e")) {
            return +(Math.round(num + "e+" + scale) + "e-" + scale);
        } else {
            const arr = ("" + num).split("e");
            let sig = "";
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
    },

    /**
     * @param {number} milliseconds
     * @returns {string} Readable time like: 01:34:11 or 12 nap | 01:34:11
    */
    RedableTime: function(milliseconds) {

        // Get hours from milliseconds
        let hours = milliseconds / (1000 * 60 * 60);

        let days = 0;
        let absoluteDays = 0;
        let d = null;

        if(hours >= 24) {
            days = hours / 24;
            absoluteDays = Math.floor(days);
            d = absoluteDays;

            hours = (days - absoluteDays) * 24;
        }

        const absoluteHours = Math.floor(hours);
        const h = absoluteHours > 9 ? absoluteHours : "0" + absoluteHours;

        // Get remainder from hours and convert to minutes
        const minutes = (hours - absoluteHours) * 60;
        const absoluteMinutes = Math.floor(minutes);
        const m = absoluteMinutes > 9 ? absoluteMinutes : "0" + absoluteMinutes;

        // Get remainder from minutes and convert to seconds
        const seconds = (minutes - absoluteMinutes) * 60;
        const absoluteSeconds = Math.floor(seconds);
        const s = absoluteSeconds > 9 ? absoluteSeconds : "0" + absoluteSeconds;

        if(d !== null) return `${d} nap | ${h}:${m}:${s}`;
        else return `${h}:${m}:${s}`;
    }
};