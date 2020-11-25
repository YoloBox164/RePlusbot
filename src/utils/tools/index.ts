import { GuildMember, Message } from "discord.js";
import Database from "../../systems/database";
import AnalyticSys from "../../systems/analytic";
import moment from "moment";

export function Clean(text: any): string {
    if (typeof (text) === "string") return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else return text;
}

export function GetNextDayInMillis(): number {
    const date = new Date(Date.now());
    date.setDate(date.getDate() + 1);
    return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

/**
 * @param array The array that will be used
 * @param valueName The name of the value that we are searching
 * @returns The values that it found under the specified name
 */
export function GetObjectValueFromArray(array: Array<any>, valueName: any) {
    const values = [];
    for(let i = 0; i < array.length; i++) {
        values.push(array[i][`${valueName}`]);
    }
    return values;
}

/**
 * @param message discord message
 * @param args message.content in an array without the command
 * @param me If is this true and everyother option fails its going to return the message.member as a target.
 * @returns a discord guild member or nothing if me is false and everyother options fails
 */
export function GetMember(message: Message, args = new Array<string>(), me = true): (GuildMember | null) {
    if(!args[0]) args = [];
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
}

/** @returns The sorted array. */
export function SortByKey(array: Array<any>, key: any) {
    return array.sort(function(a, b) {
        const x = a[key]; const y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

/**
 * @description Checks if the member has at least one of the roles.
 * @param member Discord guild member.
 * @param roleIds Array field with role ids.
 * @returns True or false
 */
export function MemberHasOneOfTheRoles(member: GuildMember, roleIds: Array<string>) {
    let bool = false;
    roleIds.forEach(roleId => {
        if(member.roles.cache.get(roleId)) bool = true;
    });
    return bool;
}

/**
 * @param year which year is it
 * @param month which month is it
 * @returns This month's length in milliseconds
 */

export function GetMonthLength(year: number, month: number) {
    const startDate = moment([year, month]);
    const endDate = moment(startDate).endOf("month");

    return endDate.unix() - startDate.unix() + 1;
}

/** @returns hours:minutes:seconds - e.g.: 01:14:54 */
export function ParseMillisecondsIntoReadableTime(milliseconds: number): string {
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
}

/**
 * @param num Number to be rounded
 * @param scale
 * @returns Rounded number
 */
export function RoundNumbere(num: number, scale: number): number {
    if(!("" + num).includes("e")) {
        return +(Math.round(parseFloat(num + "e+" + scale)) + "e-" + scale);
    } else {
        const arr = ("" + num).split("e");
        let sig = "";
        if(+arr[1] + scale > 0) {
            sig = "+";
        }
        return +(Math.round(parseFloat(+arr[0] + "e" + sig + (+arr[1] + scale))) + "e-" + scale);
    }
}

export function FirstCharUpperCase(string: string): string {
    return string[0].toUpperCase() + string.slice(1);
}

/** @returns Readable time like: 01:34:11 or 12 nap | 01:34:11 */
export function RedableTime(milliseconds: number): string {
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

export async function ShutdownSequence(message: Message, text: string) {
    try {
        await message.client.logChannel.send(`\`${text}\``);
        await message.channel.send(`\`${text}\``);
        await Database.Connection.end().then(() => console.log("Database shutdown"));
        await AnalyticSys.Shut().then(() => console.log("Analytic Sys Shut"));
    } catch (error) {
        console.error(error);
    }
    console.log(text);
    message.client.destroy();
    process.exit(0);
}

export default {
    Clean,
    FirstCharUpperCase,
    GetMember,
    GetMonthLength,
    GetNextDayInMillis,
    GetObjectValueFromArray,
    MemberHasOneOfTheRoles,
    ParseMillisecondsIntoReadableTime,
    RedableTime,
    RoundNumbere,
    ShutdownSequence,
    SortByKey
}