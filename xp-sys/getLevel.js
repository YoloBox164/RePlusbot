/** @param {number} exp */
function GetLevel(exp) {
    let d = 100;
    let nextExp = d;
    let currExp = 0;
    let level = 1;
    while(nextExp <= exp) {
        currExp += d;
        d += (level % 5 === 0 ? 100 : 50);
        nextExp += d;
        level++;
    }
    return { level, currExp, nextExp, d };
}

module.exports = GetLevel;