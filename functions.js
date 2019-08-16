module.exports = {
    GetObjectValueFromArray: function (array, value) {
        var values = [];
        for(let i = 0; i < array.length; i++) {
            values.push(array[i][`${value}`]);
        }
        return values;
    },
    
    GetTarget: function(message, args) {
        var joinedArgs = args.join(" ").toLowerCase();
        var target = message.mentions.users.first()
            || message.guild.members.find(member => joinedArgs.includes(member.displayName.toLowerCase()))
            || message.guild.members.get(args[0])
            || message.author;

        return target;
    },

    SortByKey: function(array, key) {
        return array.sort(function(a, b) {
            var x = a[key]; var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    }
}