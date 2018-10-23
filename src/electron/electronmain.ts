import { app, BrowserWindow } from "electron";

declare var __dirname: string

import * as path from "path";
import * as url from "url";
import * as fs from "fs";

let mainWindow: Electron.BrowserWindow;
let showElectronWindow = true;
let runAsDaemon = false;
let devWindow = false;
let isUserRoot = process.getuid && process.getuid() === 0;
let logFilePath = require("./common/system").System.LOGFILE_PATH;

if(!fs.existsSync(path.dirname(logFilePath)))
{
    fs.mkdirSync(path.dirname(logFilePath));
}

require("./common/environment").Environment.setEnvironmentVariable("isUserRoot", isUserRoot, "all");
require("./common/environment").Environment.setEnvironmentVariable("appPath", process.execPath, "all");

let publicOptions: Array<CommandlineOption> = [
    {
        option: "-h",
        optionLong: "--help",
        description: "\tGet Help of TUXEDO Control Center",
        action: (arg, index, array) => {
            printHelp();
            process.exit();
        }
    },
    {
        option: "-v",
        optionLong: "--version",
        description: "Get the Version of TUXEDO Control Center",
        action: (arg, index, array) => {
            console.log(app.getVersion());
            process.exit();
        }
    },
    {
        option: null,
        optionLong: "--startdaemon",
        description: "Start TUXEDO Control Center Daemon",
        action: (arg, index, array) => {
            if(!isUserRoot)
            {
                console.log("You must be root, to start the daemon");
            }
            else
            {
                require("./common/daemon").start();
            }

            process.exit();
        }
    },
    {
        option: null,
        optionLong: "--stopdaemon",
        description: "Stop TUXEDO Control Center Daemon",
        action: (arg, index, array) => {
            if(!isUserRoot)
            {
                console.log("You must be root, to stop the daemon");
            }
            else
            {
                require("./common/daemon").stop();
            }

            process.exit();
        }
    },
    {
        option: null,
        optionLong: "--restartdaemon",
        description: "Restart TUXEDO Control Center Daemon",
        action: (arg, index, array) => {
            if(!isUserRoot)
            {
                console.log("You must be root, to restart the daemon");
            }
            else
            {
                require("./common/daemon").restop();
            }

            process.exit();
        }
    },
    {
        option: null,
        optionLong: "--statusdaemon",
        description: "Get the status of TUXEDO Control Center Daemon",
        action: (arg, index, array) => {
            printdaemonstatus();
            process.exit();
        }
    },
    {
        option: null,
        optionLong: "--createunitfile",
        description: "Create Unit File for Systemd",
        action: (arg, index, array) => {
            if(!isUserRoot)
            {
                console.log("You must be root, to create unit file");
            }
            else
            {
                try
                {
                    let environment = require("./common/environment").Environment;
                    environment.setEnvironmentVariable("fs", require("fs"), "electron");
                    environment.setEnvironmentVariable("path", require("path"), "electron");

                    require("./common/system").System.createUnitFile();
                }
                catch(error)
                {
                    console.log("Error at create unit file");
                    console.log(error);
                }
            }

            process.exit();
        }
    },
    {
        option: null,
        optionLong: "--removeunitfile",
        description: "Remove Unit File for Systemd",
        action: (arg, index, array) => {
            if(!isUserRoot)
            {
                console.log("You must be root, to remove unit file");
            }
            else
            {
                try
                {
                    let environment = require("./common/environment").Environment;
                    environment.setEnvironmentVariable("fs", require("fs"), "electron");
                    environment.setEnvironmentVariable("path", require("path"), "electron");

                    require("./common/system").System.removeUnitFile();
                }
                catch(error)
                {
                    console.log("Error at remove unit file");
                    console.log(error);
                }
            }

            process.exit();
        }
    }
];

let privateOptions: Array<CommandlineOption> = [
    {
        option: null,
        optionLong: "--debugfan",
        description: "",
        action: (arg, index, array) => { devWindow = true; }
    },
    {
        option: null,
        optionLong: "--daemon",
        description: "",
        action: (arg, index, array) => {
            if(!isUserRoot)
            {
                console.log("User is not root, abort.");
                process.exit(1);
            }

            try
            {
                fs.writeFileSync(logFilePath, "Configure daemon", { flag: "a" });

                let environment = require("./common/environment").Environment;
                environment.setDaemonMode(true);

                environment.setEnvironmentVariable("fs", require("fs"), "daemon");
                environment.setEnvironmentVariable("os", require("os"), "daemon");
                environment.setEnvironmentVariable("path", require("path"), "daemon");
                environment.setEnvironmentVariable("child_process", require("child_process"), "daemon");
                environment.setEnvironmentVariable("log", console.log, "daemon");
                environment.setEnvironmentVariable("ec_access", require("./modules/ec_access.node"), "daemon");
                environment.setEnvironmentVariable("appPath", app.getAppPath(), "daemon");

                require("./common/daemonworker").DaemonWorker.start();
                showElectronWindow = false;
                runAsDaemon = true;
            }
            catch (error)
            {
                fs.writeFileSync(logFilePath, "Error at start daemon, error: " + error + "\n", { flag: "a" });
            }
        }
    },
    {
        option: null,
        optionLong: "--expert",
        description: "",
        action: (arg, index, array) => { 
            (<any>global).exportMode = true;
         }
    }
];

app.setName("TUXEDO FAN Control");
parseCommandLine();

function createWindow(): void
{
    mainWindow = new BrowserWindow({
        height: 340,
        width: 880,
        icon: path.join(__dirname, "data", "32x32.png"),
        title: "TUXEDO Fan Control"
    });

    mainWindow.setMenu(null);
    mainWindow.setResizable(false);

    let startPath = url.format({
        pathname: path.join(__dirname, "tuxedo-fan-control", "index.html"),
        protocol: 'file:',
        slashes: true
    });
    mainWindow.loadURL(startPath);

    if (devWindow)
    {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

if (showElectronWindow && !runAsDaemon) {
    app.on("ready", createWindow);
    app.on("window-all-closed", app.quit);
}

function parseCommandLine(): void
{
    try
    {
        process.argv.forEach(function (arg, index, array) {
            if (publicOptions.find(x => x.option === arg)) {
                publicOptions.find(x => x.option === arg).action(arg, index, array);
            }

            if (publicOptions.find(x => x.optionLong === arg)) {
                publicOptions.find(x => x.optionLong === arg).action(arg, index, array);
            }

            if (privateOptions.find(x => x.option === arg)) {
                privateOptions.find(x => x.option === arg).action(arg, index, array);
            }

            if (privateOptions.find(x => x.optionLong === arg)) {
                privateOptions.find(x => x.optionLong === arg).action(arg, index, array);
            }
        });
    }
    catch (error)
    {
        console.log(error);
    }
}

function printHelp(): void
{
    console.log("TUXEDO FAN Control");
    console.log("Version: " + app.getVersion() + "\n");
    console.log("Commandline Arguments:\n");

    for (let option of publicOptions) {
        if (option.option === null) {
            console.log(`\t${option.optionLong}\t\t\t${option.description}`);
        }
        else {
            console.log(`${option.option}\t${option.optionLong}\t\t\t${option.description}`);
        }
    }

    process.exit();
}

function printdaemonstatus(): void
{
    let daemon = require("./common/daemon");
    console.log("Is Running: " + daemon.isDaemonRunning());
    console.log("Daemon PID: " + daemon.getDaemonPid());
}

class CommandlineOption
{
    option: string;
    optionLong: string;
    description: string;
    action: (arg: string, index: number, array: string[]) => void;
}
