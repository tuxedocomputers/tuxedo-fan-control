import { app, BrowserWindow } from "electron";

declare var __dirname: string

import * as path from "path";
import * as url from "url";
import * as fs from "fs";

let logFilePath = require("./common/system").System.LOGFILE_PATH;
if(!fs.existsSync(path.dirname(logFilePath)))
{
    fs.mkdirSync(path.dirname(logFilePath));
}

let mainWindow: Electron.BrowserWindow;
let showElectronWindow = true;
let runAsDaemon = false;
let devWindow = false;
let isUserRoot = process.getuid && process.getuid() === 0;

let distribution: string = require("./common/system").System.getDistribution(fs.readFileSync("/etc/os-release").toString());
let distributionVersion: string = require("./common/system").System.getDistributionVersion(fs.readFileSync("/etc/os-release").toString());

fs.writeFileSync(logFilePath, "--------------------\n", { flag: "a" });
fs.writeFileSync(logFilePath, new Date().toISOString() + "; Application Version : " + app.getVersion() + "\n", { flag: "a" });
fs.writeFileSync(logFilePath, new Date().toISOString() + "; Distribution        : " + distribution+ "\n" , { flag: "a" });
fs.writeFileSync(logFilePath, new Date().toISOString() + "; Distribution Version: " + distributionVersion + "\n" , { flag: "a" });

require("./common/environment").Environment.setEnvironmentVariable("isUserRoot", isUserRoot, "all");
require("./common/environment").Environment.setEnvironmentVariable("appPath", process.execPath, "all");
require("./common/environment").Environment.setEnvironmentVariable("vendorcheck", true, "all");
(<any>global).vendorcheck = true;

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
        option: "-s",
        optionLong: "--show",
        description: "Get the Current Fan Informations",
        action: (arg, index, array) => {
            let environment = require("./common/environment").Environment;
            environment.setDaemonMode(false);
            environment.setEnvironmentVariable("child_process", require("child_process"), "electron");
            environment.setEnvironmentVariable("fs", require("fs"), "electron");
            environment.setEnvironmentVariable("ec_access", require("./modules/ec_access.node"), "electron");

            tuxedoCheckerAndExecuter(printCurrentFanInformations);
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
                require("./common/environment").Environment.setEnvironmentVariable("ec_access", require("./modules/ec_access.node"), "electron");
                require("./common/environment").Environment.setEnvironmentVariable("fs", require("fs"), "all");

                tuxedoCheckerAndExecuter(() => {
                    require("./common/daemon").start();
                });
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
                require("./common/environment").Environment.setEnvironmentVariable("ec_access", require("./modules/ec_access.node"), "electron");
                require("./common/environment").Environment.setEnvironmentVariable("fs", require("fs"), "all");

                tuxedoCheckerAndExecuter(() => {
                    require("./common/daemon").stop();
                });
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
                require("./common/environment").Environment.setEnvironmentVariable("ec_access", require("./modules/ec_access.node"), "electron");
                require("./common/environment").Environment.setEnvironmentVariable("fs", require("fs"), "all");

                tuxedoCheckerAndExecuter(() => {
                    require("./common/daemon").restart();
                });
            }

            process.exit();
        }
    },
    {
        option: null,
        optionLong: "--statusdaemon",
        description: "Get the status of TUXEDO Control Center Daemon",
        action: (arg, index, array) => {
            require("./common/environment").Environment.setEnvironmentVariable("fs", require("fs"), "all");

            tuxedoCheckerAndExecuter(printdaemonstatus);
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
                let environment = require("./common/environment").Environment;
                environment.setEnvironmentVariable("fs", require("fs"), "electron");
                environment.setEnvironmentVariable("path", require("path"), "electron");

                tuxedoCheckerAndExecuter(() => {
                    try
                    {    
                        require("./common/system").System.createUnitFile();
                    }
                    catch(error)
                    {
                        console.log("Error at create unit file");
                        console.log(error);
                    }
                });
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
                let environment = require("./common/environment").Environment;
                environment.setEnvironmentVariable("fs", require("fs"), "electron");
                environment.setEnvironmentVariable("path", require("path"), "electron");

                tuxedoCheckerAndExecuter(() => {
                    try
                    {
                        require("./common/system").System.removeUnitFile();
                    }
                    catch(error)
                    {
                        console.log("Error at remove unit file");
                        console.log(error);
                    }
                });
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
            let environment = require("./common/environment").Environment;
            environment.setDaemonMode(true);
            environment.setEnvironmentVariable("fs", require("fs"), "daemon");

            tuxedoCheckerAndExecuter(() => { 
                try
                {
                    fs.writeFileSync(logFilePath, "Configure daemon", { flag: "a" });
                    
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
            });
        }
    },
    {
        option: null,
        optionLong: "--expert",
        description: "",
        action: (arg, index, array) => { 
            (<any>global).expertMode = true;
         }
    },
    {
        option: null,
        optionLong: "--novendorcheck",
        description: "",
        action: (arg, index, array) => { 
            (<any>global).vendorcheck = false;
         }
    }
];

app.setName("TUXEDO FAN Control");
parseCommandLine();

function createWindow(): void
{
    mainWindow = new BrowserWindow({
        height: 400,
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

function printCurrentFanInformations(): void
{
    let ec_access = require("./common/ec_access");
    let system = require("./common/system").System;
    let cpuInfos = ec_access.getFanInformation(ec_access.FAN.CPUDATA);
    let gpuOneInfon = null;
    let gpuTwoInfon = null;

    console.log(cpuInfos);

    if(system.checkIfNvidiaCardExists())
    {
        console.log("Nvidia Card exist");
        gpuOneInfon = ec_access.getFanInformation(ec_access.FAN.GPUONEDATA);
        
        for(let i = 0; i < 100000; i++) {}

        gpuTwoInfon = ec_access.getFanInformation(ec_access.FAN.GPUTWODATA);

        console.log(gpuOneInfon);
        console.log(gpuTwoInfon);
    }
    else
    {
        console.log("Nvidia Card does not exist");
    }
}

function tuxedoCheckerAndExecuter(func: Function): void
{
    if((<any>global).vendorcheck && !require("./common/system").System.isTuxedoDevice())
    {
        console.log("No TUXEDO device found");
    }
    else if(!(<any>global).vendorcheck || ((<any>global).vendorcheck && require("./common/system").System.isTuxedoDevice()))
    {
        func();
    }
}

class CommandlineOption
{
    option: string;
    optionLong: string;
    description: string;
    action: (arg: string, index: number, array: string[]) => void;
}
