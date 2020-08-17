const Database = require("../database");
const { createCanvas, loadImage } = require("canvas");
const GetLevel = require("./getLevel");

/**
 * @async
 * @param {import("../database").Users} userData
 * @param {import("discord.js").GuildMember} targetMember
 */
async function GetCanvas(userData, targetMember) {
    const width = 800;
    const height = 300;

    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");

    // Backgound img
    const bgImg = await loadImage("./bg_img.jpg");
    context.drawImage(bgImg, 0, 0, width, height);

    const avatarURL = targetMember.user.displayAvatarURL({ format: "png", size: 4096 });
    const profileImage = await loadImage(avatarURL);

    // Background of the card
    context.fillStyle = "#e6e6e6";
    context.fillRect(100, 20, 680, 260);

    // Image border and image
    context.fillStyle = "#6e6e6e";
    context.fillRect(44, 44, 212, 212);
    context.fillStyle = "#fff";
    context.fillRect(46, 46, 208, 208);
    context.drawImage(profileImage, 50, 50, 200, 200);

    // Profile name
    context.font = "bold 28pt Menlo";
    context.textAlign = "left";
    context.textBaseline = "middle";
    context.fillStyle = "#6e6e6e";
    const profileName = targetMember.displayName;
    context.fillText(profileName, 300, 60);

    // Exp bar border
    context.fillRect(298, 98, 454, 44); // #6e6e6e

    // Exp bar margin
    context.fillStyle = "#fff";
    context.fillRect(300, 100, 450, 40);

    // Exmaple Level 4: 450 - 700 (d: 250)

    const { level, d, currExp, nextExp } = GetLevel(userData.exp);

    // Exp bar
    const expBarMaxWidth = 442;
    const expBarXPos = 304;
    const percent = (userData.exp - currExp) / d * 100;
    const expBarWidth = (expBarMaxWidth / 100) * percent;
    context.fillStyle = "#b3b3b3";
    context.font = "bold 24pt Menlo";
    context.fillRect(expBarXPos, 104, expBarWidth, 32);

    // Exp text
    context.textAlign = "center";
    context.textBaseline = "top";
    context.fillStyle = "#6e6e6e";
    const expText = `EXP: ${userData.exp}/${nextExp}`;
    context.fillText(expText, expBarXPos + (expBarMaxWidth / 2), 100);

    // Level title text
    context.font = "580 30pt Menlo";
    context.fillStyle = "#6e6e6e";
    const levelTitleText = "LEVEL";
    context.fillText(levelTitleText, 350, 146);

    // Level text
    context.font = "bold 44pt Menlo";
    context.fillText(level, 350, 190);

    // Vertical bar
    context.lineWidth = 4;
    context.strokeStyle = "#b3b3b3";
    context.beginPath();
    context.moveTo(420, 150);
    context.lineTo(420, 270);
    context.closePath();
    context.stroke();

    // Server rank text

    /** @type {Array<{id:string}>} */
    let userRanks = await Database.Connection.query("SELECT id FROM Users ORDER BY exp DESC");
    if(!userRanks) userRanks = [];
    context.textAlign = "left";
    context.font = "normal 18pt Menlo";
    context.fillStyle = "#6e6e6e";
    const serverRankText = `Szerver rang: #${userRanks.findIndex(row => row.id == targetMember.id) + 1}`;
    context.fillText(serverRankText, 480, 170);

    // Bits text
    let userCurrency = await Database.GetData("Currency", targetMember.id);
    if(!userCurrency) userCurrency = { bits: 0 };
    const bitsText = `Bitek: ${userCurrency.bits}`;
    context.fillText(bitsText, 480, 210);

    return canvas.toBuffer("image/png");
}

module.exports = GetCanvas;