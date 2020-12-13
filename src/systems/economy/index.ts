import { GuildMember, MessageEmbed, User } from "discord.js";
import Tools from "../../utils/tools";
import Database from "../database";
import { Roles } from "../../settings.json";

export enum ResponseTypes {
    "NONE",
    "INSUFFICIENT",
    "DONE"
}

enum LogTypeHelp {
    ADD = "Jóváírás",
    REMOVE = "Levonás",
    TRANSFER = "Utalás"
}

class Economy {
    public static readonly MAX_MONEY = 1_000_000;
    public static readonly MIN_MONEY = -1_000_000;

    public static readonly DAILY_AMOUNT = 250; // Bits
    public static readonly DAILY_STREAK_BONUS = 750; // Bits
    public static readonly WUMPUS_ROLE_COST = 5_500; // Bits
    public static readonly CUSTOM_EMOJI_COST = 2_500; // Bits

    public static readonly DAY_IN_MILLIS = 86_400_000;

    public static async GetInfo(member: GuildMember) {
        try {
            let userData = await Database.GetData("Currency", member.id);
            
            if(!userData) {
                userData = {
                    id: member.id,
                    bits: 0,
                    claimTime: 0,
                    streak: 0
                }
                await Database.SetData("Currency", userData);
            }

            return Promise.resolve(userData);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    public static async Daily(member: GuildMember) {
        try {
            const timeNow = Date.now();
            const nextDayInMillis = Tools.GetNextDayInMillis();

            let userData = await Database.GetData("Currency", member.id);

            if(!userData) {
                userData = {
                    id: member.id,
                    bits: this.DAILY_AMOUNT,
                    claimTime: timeNow,
                    streak: 1
                }

                await Database.SetData("Currency", userData);

                this.Log("ADD", member, this.DAILY_AMOUNT, userData.bits);

                return Promise.resolve({ userData, streakDone: false });
            }

            if(member.client.devId === member.id || userData.claimTime <= nextDayInMillis) {
                if(userData.claimTime <= nextDayInMillis - (this.DAY_IN_MILLIS * 2)) {
                    userData.streak = 0;
                }
                userData.claimTime = timeNow + this.DAY_IN_MILLIS;
                userData.bits += this.DAILY_AMOUNT;
                if(userData.streak >= 5) userData.streak = 0;
                userData.streak++;
                let streakDone = false;
                if(userData.streak === 5) {
                    userData.bits += this.DAILY_STREAK_BONUS;
                    streakDone = true;
                }
            
                await Database.SetData("Currency", userData);

                this.Log("ADD", member, streakDone ? this.DAILY_AMOUNT + this.DAILY_STREAK_BONUS : this.DAILY_AMOUNT, userData.bits);

                return Promise.resolve({ userData, streakDone });
            }

            return Promise.resolve<null>(null);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    public static async Add(member: GuildMember, amount: number) {
        try {
            let userData = await Database.GetData("Currency", member.id);

            if(!userData) {
                userData = {
                    id: member.id,
                    bits: 0,
                    claimTime: 0,
                    streak: 0
                }
            }
    
            if(amount > this.MAX_MONEY) userData.bits = this.MAX_MONEY;
            else userData.bits += amount;
    
            await Database.SetData("Currency", userData);

            this.Log("ADD", member, amount, userData.bits);

            return Promise.resolve(userData);
        } catch (error) {
            return Promise.reject(error);
        }   
    }

    public static async Remove(member: GuildMember, amount: number) {
        try {
            let userData = await Database.GetData("Currency", member.id);
            if(!userData) {
                userData = {
                    id: member.id,
                    bits: 0,
                    claimTime: 0,
                    streak: 0
                }
            }
    
            if(amount < this.MIN_MONEY) userData.bits = this.MIN_MONEY;
            else userData.bits -= amount;
    
            await Database.SetData("Currency", userData);

            this.Log("REMOVE", member, amount, userData.bits);
            
            return Promise.resolve(userData);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    public static async Transfer(fromMember: GuildMember, toMember: GuildMember, amount: number) {
        try {
            let fromUserData =  await Database.GetData("Currency", fromMember.id);
            let toUserData = await Database.GetData("Currency", toMember.id);

            let response = ResponseTypes.NONE;

            if(!fromUserData) {
                fromUserData = {
                    id: fromMember.id,
                    bits: 0,
                    claimTime: 0,
                    streak: 0
                };
                response = ResponseTypes.INSUFFICIENT;
            }

            if(!toUserData) {
                toUserData = {
                    id: toMember.id,
                    bits: 0,
                    claimTime: 0,
                    streak: 0
                };
            }

            if(fromUserData.bits >= amount) {
                toUserData.bits += amount;
                fromUserData.bits -= amount;
                response = ResponseTypes.DONE;
            } else response = ResponseTypes.INSUFFICIENT;

            Database.SetData("Currency", fromUserData);
            Database.SetData("Currency", toUserData);

            if(response === ResponseTypes.DONE) {
                this.Log("TRANSFER", fromMember, amount, fromUserData.bits, toMember, toUserData.bits);
            }

            return Promise.resolve({ fromUserData, toUserData, response });
        } catch (error) {
            return Promise.reject(error);
        }
    }

    public static async CheckWumpus(member: GuildMember) {
        try {
            const wumpusData = await Database.GetData("Wumpus", member.id);
            const hasWumpusRole = member.roles.cache.has(Roles.WumpusId);

            if(!wumpusData && hasWumpusRole) {
                return member.roles.remove(Roles.WumpusId).catch(console.error);
            } else if(!wumpusData && !hasWumpusRole) return Promise.resolve();

            if(wumpusData.perma && !hasWumpusRole) {
                return member.roles.add(Roles.WumpusId).catch(console.error);
            } else if(wumpusData.perma && hasWumpusRole) return Promise.resolve(wumpusData);

            const timestampt = Date.now();
            const date = new Date(timestampt);
            date.setMonth(date.getMonth() - 1);
            const monthLength = Tools.GetMonthLength(date.getFullYear(), date.getMonth());

            if(wumpusData.roleTime + monthLength < timestampt) {
                const currencyData = await Database.GetData("Currency", member.id)

                if(currencyData.bits >= this.WUMPUS_ROLE_COST) {
                    const embed = new MessageEmbed()
                        .setTimestamp(timestampt)
                        .setColor("#f47fff")
                        .setTitle("Wumpus")
                        .setDescription(`${member} Wumpus+ havi kölcsége levonva!`);
                    let sub = this.WUMPUS_ROLE_COST;
                    embed.addField("Összeg", `\`\`\`${sub} bits\`\`\``);
                    if(wumpusData.hasCustomEmoji) {
                        if(currencyData.bits >= this.WUMPUS_ROLE_COST + this.CUSTOM_EMOJI_COST) {
                            sub += this.CUSTOM_EMOJI_COST;
                            embed.addField("Összeg", `\`\`\`${sub} bits\`\`\``);
                        } else {
                            wumpusData.hasCustomEmoji = false;
                            embed.addField("Elvesztett Bónuszok", "Egyéni Emoji");
                        }
                    }
                    currencyData.bits -= sub;
                    embed.addField(`${member.displayName} egyenlege`, `\`\`\`${currencyData.bits} bits\`\`\``);
                    await Database.SetData("Currency", currencyData);
                    wumpusData.roleTime = timestampt;
                    await Database.SetData("Wumpus", wumpusData);
                    if(!hasWumpusRole) member.roles.add(Roles.WumpusId);

                    member.client.economyLogChannel.send(embed);
                } else {
                    await Database.DeleteData("Wumpus", member.id);
                    member.roles.remove(Roles.WumpusId, "Did not have enough bits.");
                    const embed = new MessageEmbed()
                        .setTimestamp(timestampt)
                        .setColor("#f47fff")
                        .setTitle("Wumpus")
                        .setDescription(`Bit hiány miatt ${member} elvesztette a Wumpus+ rangját és minden hozzá járúló bónuszt!`)
                        .addField(`${member.displayName} egyenlege`, `\`\`\`${currencyData.bits} bits\`\`\``);
                    member.client.economyLogChannel.send(embed);
                }
            }

            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    }

    private static Log(type: "ADD"|"REMOVE"|"TRANSFER", member: GuildMember, amount: number, bits: number, toMember?: GuildMember, toBits?: number) {
        const embed = new MessageEmbed()
            .setTimestamp(Date.now())
            .setColor("#78b159")
            .setTitle(`${LogTypeHelp[type]} (Bits)`)
            .addFields([
                { name: "Felhasználó", value: `${member}`, inline: false },
                { name: "Menyiség", value: `\`\`\`${amount} bits\`\`\``, inline: true },
                { name: "Egyenleg", value: `\`\`\`${bits} bits\`\`\``, inline: true },
            ]);

        if(type === "TRANSFER") {
            embed.fields[0] = {
                name: "Felhasználók",
                value: `${member} => ${toMember}`,
                inline: false
            };
            embed.fields[1].inline = false;
            embed.fields[2].name = `${member.displayName} egyenlege`
            embed.fields[2].inline = false;
            embed.addField(`${toMember.displayName} egyenlege`, `\`\`\`${toBits} bits\`\`\``, false);
        }

        return member.client.economyLogChannel.send({ embed: embed });
    }
}

export default Economy;