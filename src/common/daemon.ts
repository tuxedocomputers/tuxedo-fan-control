import * as electron from "electron"; //important, not reference but without can not find module "child_process"
import * as process from "process";
import * as child_process from "child_process";
import * as fs from "fs";
import { System } from "./system";

/**
 * Starts the Daemon
 */
export function start(): void
{
    fs.writeFileSync(System.LOGFILE_PATH_DAEMON, "start daemon\n", { flag: "a" });
    try
    {
        if(fs.existsSync(System.PID_FILE_PATH))
        {
            let daemonPid: number = Number(fs.readFileSync(System.PID_FILE_PATH).toString());
            fs.writeFileSync(System.LOGFILE_PATH_DAEMON, "Daemon is always running" + daemonPid + "\n", { flag: "a" });

            return;
        }

        if(fs.existsSync(System.XLOCK_FILE))
        {
            fs.unlinkSync(System.XLOCK_FILE);
        }

        let daemonPath: string = process.execPath;
        let path: string = daemonPath + " ./output/dist/ --daemon";
        fs.writeFileSync(System.LOGFILE_PATH_DAEMON, "daemonpath : " + path + "\n", { flag: "a" });
        let child = child_process.spawn(daemonPath, [__dirname + "/..", "--daemon"]);

        child.on("close", _daemonClose);

        fs.writeFileSync(System.PID_FILE_PATH, child.pid);
    }
    catch (error)
    {
        fs.writeFileSync(System.LOGFILE_PATH_DAEMON, "Error at closed daemon, error: " + error + "\n", { flag: "a" });
    }
}

/**
 * Check the close return
 */
function _daemonClose(returnCode: number): void
{
    fs.writeFileSync(System.LOGFILE_PATH_DAEMON, "\nclose daemon\n", { flag: "a" });

    if(returnCode !== 0)
    {
        fs.writeFileSync(System.LOGFILE_PATH_DAEMON, "Error at closed daemon, error code: " + returnCode + "\n", { flag: "a" });
    }
    else
    {
        fs.writeFileSync(System.LOGFILE_PATH_DAEMON, "error, code: daemon closed\n", { flag: "a" });
    }
}

/**
 * Stops the Daemon
 */
export function stop(): void
{
    if(fs.existsSync(System.PID_FILE_PATH))
    {
        let daemonPid: number = Number(fs.readFileSync(System.PID_FILE_PATH).toString());

        try
        {
            process.kill(daemonPid, "SIGINT");
            fs.unlinkSync(System.XLOCK_FILE);
        }
        catch (error)
        {
            fs.writeFileSync(System.LOGFILE_PATH_DAEMON, "Error at stop daemon, error: " + error + "\n", { flag: "a" });
        }

        fs.unlinkSync(System.PID_FILE_PATH);
    }
}

/**
 * Stops the Daemon
 */
export function restart(): void
{
    stop();
    start();
}

/**
 * Check if Daemon running
 *
 * @returns Returns a boolean if indicate the daemon is running (true) oder not (false)
 */
export function isDaemonRunning(): boolean
{
    fs.writeFileSync(System.LOGFILE_PATH_DAEMON, "check if daemon running\n", { flag: "a" });

    if(fs.existsSync(System.PID_FILE_PATH))
    {
        let daemonPid: number = Number(fs.readFileSync(System.PID_FILE_PATH).toString());

        if(daemonPid === NaN)
        {
            return false;
        }

        try
        {
            let process_return = child_process.execSync("ps -p " + daemonPid + " -o comm=").toString();
            fs.writeFileSync(System.LOGFILE_PATH_DAEMON, "process_return: " + process_return + "\n", { flag: "a"} );

            if(process_return !== "")
            {
                return true;
            }
            else
            {
                return false;
            }
        }
        catch(err)
        {
            fs.writeFileSync(System.LOGFILE_PATH_DAEMON, "err.stdout: " + err.stdout + "\n", { flag: "a"} );
            fs.writeFileSync(System.LOGFILE_PATH_DAEMON, "err.stderr: " + err.stderr + "\n", { flag: "a"} );
            fs.writeFileSync(System.LOGFILE_PATH_DAEMON, "err.pid: " + err.pid + "\n", { flag: "a"} );
            fs.writeFileSync(System.LOGFILE_PATH_DAEMON, "err.signal: " + err.signal + "\n", { flag: "a"} );
            fs.writeFileSync(System.LOGFILE_PATH_DAEMON, "err.status: " + err.status + "\n", { flag: "a"} );

            return false;
        }
    }

    return false;
}

/**
 * Get the PID of the Daemon
 *
 * @returns Returns a number with the PID of the Daemon
 */
export function getDaemonPid(): number
{
    let daemonPid: number = 0;
    if(fs.existsSync(System.PID_FILE_PATH))
    {
        daemonPid = Number(fs.readFileSync(System.PID_FILE_PATH).toString());
    }

    return daemonPid;
}
