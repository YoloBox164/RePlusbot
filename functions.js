module.exports = {
    GetObjectValueFromArray: function (array, value) {
        var values = [];
        for(let i = 0; i < array.length; i++) {
            values.push(array[i][`${value}`]);
        }
        return values;
    },
    
    GetMember: function(message, args) {
        if(!args[0]) return false;
        var joinedArgs = args.join(" ").toLowerCase();
        var target = message.guild.member(message.mentions.users.first())
            || message.guild.members.find(member => joinedArgs.includes(member.displayName.toLowerCase()))
            || message.guild.members.get(args[0])
            || message.member;
        return target; //give back a guildmember
    },

    SortByKey: function(array, key) {
        return array.sort(function(a, b) {
            var x = a[key]; var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    },

    MemberHasRoles: function(member, roleIds) {
        roleIds.forEach(roleId => {
            if(member.roles.get(roleId)) return true;
        }); return false;
    },

    GetMonthDateRange: function(year, month) {
        var moment = require('moment');
        
        var startDate = moment([year, month]);
        var endDate = moment(startDate).endOf('month');
    
        return { start: Date.parse(startDate), end: Date.parse(endDate) };
    },

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
    }
}