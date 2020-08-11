const { Collection } = require("discord.js");

const fs = require("fs");
const colors = require("colors");

const PathToCmds = "./cmds"; // Relative to bot.js

/** @type {Collection<string, Command>} */
const commands = new Collection();

/** @type {Collection<string, string[]>} */
const categories = new Collection();

class Command {
    /**
     * @typedef {Object} CommandOptions
     * @property {boolean} args True if some args must be provided
     * @property {boolean} dev True if this is a developer command
     * @property {string} name
     * @property {string[]} aliases
     * @property {string} desc
     * @property {string} usage
     * @property {string} pathToCmd A relative path to the command for the fs module
     *
     * @param {(message: import("discord.js").Message, args: string[]) => void} execute
     * @param {CommandOptions} options
     */
    constructor(execute, options) {
        this.execute = execute;
        this.args = options.args;
        this.dev = options.dev;
        this.name = options.name;
        this.aliases = options.aliases;
        this.desc = options.desc;
        this.usage = options.usage;
        this.pathToCmd = options.pathToCmd;
    }
}

class CommandHandler {
    constructor() { this.isCommandsLoaded = false; }
    loadCmds() {
        this.isCommandsLoaded = true;

        let counter = 0;
        for(const category of fs.readdirSync(PathToCmds)) {
            console.log(colors.cyan(`Loading ${category} commands!`));
            const files = fs.readdirSync(`${PathToCmds}/${category}/`);

            counter += files.length;

            for(const file of files) {
                files.forEach((v, i, a) => a[i] = v.split(".").shift());
                this.categories.set(category, files);
                loadCmd(`${PathToCmds}/${category}/${file}`);
            }
            console.log(colors.cyan(`Successfully loaded ${category} commands!\n`));
        }
        console.log(colors.green.bold(`Successfully loaded all the ${counter} commands!\n`));
    }
    reloadCmd(cmdName) {
        if(!this.isCommandsLoaded) throw "Commands must be loaded to be able to use this function!";
        if(commands.has(cmdName)) {
            loadCmd(commands.get(cmdName).pathToCmd);
        }
    }
    get categories() {
        if(!this.isCommandsLoaded) throw "Commands must be loaded to be able to use this function!";
        return categories;
    }
    get commands() {
        if(!this.isCommandsLoaded) throw "Commands must be loaded to be able to use this function!";
        return commands;
    }
}

module.exports = new CommandHandler();

/** @param {string} path */
function loadCmd(path) {
    delete require.cache[require.resolve(path)];

    //        [0]/ [1]/[2]/ [3]
    // example ./cmds/dev/eval.js
    const file = path.split("/").pop();

    /** @type {import("./typings").cmd} */
    const props = require(path);

    console.log(colors.white(`${file} loaded!`));

    commands.set(props.name, new Command(props.execute, {
        args: props.args,
        name: props.name,
        aliases: props.aliases,
        desc: props.desc,
        usage: props.usage,
        pathToCmd: path
    }));
}

/* Old Command Loader
    const dirs = fs.readdirSync("./cmds/");
    if(!dirs) console.error(`ERROR: No `);
    dirs.forEach(dir => {
        fs.readdir(`./cmds/${dir}/`, (err, files) => {
            if(err) console.error(`ERROR: ${err}`);

            const jsfiles = files.filter(f => f.split(".").pop() === "js");
            if(jsfiles.length <= 0) {
                console.log(colors.red("ERROR: No commands to load!"));
                return;
            }

            console.log(colors.cyan(`Loading ${jsfiles.length} ${dir} commands!`));

            //** @type {string[]} * /
            const cmdNames = [];

            jsfiles.forEach((f, i) => {
                delete require.cache[require.resolve(`./cmds/${dir}/${f}`)];
                /** @type {import("./typings").cmd} * /
                const props = require(`./cmds/${dir}/${f}`);
                console.log(colors.white(`${i + 1}: ${f} loaded!`));
                cmdNames.push(props.help.cmd);
                if(dir == "dev") {devCommands.set(props.help.cmd, props);} else {
                    commands.set(props.help.cmd, props);
                    props.help.alias.forEach((name) => {
                        aliasCmds.set(name, props.help.cmd);
                    });
                }
            });

            categories.set(dir, cmdNames);

            if(dir != "dev") {
                bot.categories = categories;
                bot.commands = commands;
                bot.aliasCmds = aliasCmds;
            }

            console.log(colors.cyan(`Successfully loaded ${jsfiles.length} ${dir} commands!\n`));
        });
    });
*/