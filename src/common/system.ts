import { Environment } from "./environment";

/**
 * Class for accessing Operatin System informations
 */
export class System
{
    public static readonly SYSTEMD_SERVICE_FILE: string = "/etc/systemd/system/tuxedofancontrol.service";
    public static readonly SYSTEMD_SERVICE_NAME: string = "tuxedofancontrol.service";
    public static readonly LOGFILE_PATH_DAEMON: string = "/var/log/tuxedo-fan/tuxedo-fan-daemon.log";
    public static readonly LOGFILE_PATH: string = "/var/log/tuxedo-fan/tuxedo-fan.log";
    public static readonly PID_FILE_PATH: string = "/var/run/tuxedo-fan-daemon.pid";
    public static readonly XLOCK_FILE: string = "/tmp/.X99-lock";

    /**
     * Check if running the Application inside Electron
     *
     * @returns Return boolean. True for running inside Electron, otherwise false as Running as Angular SPA
     */
    public static get isRunningAsElectronApp(): boolean
    {
        return (<any>window).electron || window.location.protocol == "file:";
    }

    /**
     * Wrapper for Node.JS function 'os.uptime()'.
     * For more informations https://nodejs.org/api/os.html#os_os_uptime
     *
     * @returns The os.uptime() method returns the system uptime in number of seconds.
     */
    public static uptime(): number
    {
        return Environment.getObject("os").uptime();
    }

    /**
     * Reading the DMI and returns the DMI Model Name
     *
     * @returns The DMI Model Name of the device
     */
    public static getDmiModelName(): string
    {
        let fs: any = Environment.getObject("fs");

        fs.writeFileSync(System.LOGFILE_PATH_DAEMON, "getDmiModelName\n", { flag: "a" });
        try
        {
            fs.writeFileSync(System.LOGFILE_PATH_DAEMON, "read string and trim\n", { flag: "a" });
            return fs.readFileSync("/sys/class/dmi/id/board_name").toString().trim();
        }
        catch (error)
        {
            fs.writeFileSync(System.LOGFILE_PATH_DAEMON, "error: " + error.toString() + "\n", { flag: "a" });
        }

        return "";
    }

    /**
     * Reading the DMI and returns the DMI Model Vendor
     *
     * @returns The DMI Model Vendor of the device
     */
    public static getDmiModelVendor(): string
    {
        let fs: any = Environment.getObject("fs");

        fs.writeFileSync(System.LOGFILE_PATH_DAEMON, "getDmiModelVendor\n", { flag: "a" });
        try
        {
            fs.writeFileSync(System.LOGFILE_PATH_DAEMON, "read string and trim\n", { flag: "a" });
            return fs.readFileSync("/sys/class/dmi/id/board_vendor").toString().trim();
        }
        catch (error)
        {
            fs.writeFileSync(System.LOGFILE_PATH_DAEMON, "error: " + error.toString() + "\n", { flag: "a" });
        }

        return "";
    }

    /**
     * Check if the device a TUXEDO device
     * 
     * @returns A boolean that indicat is a TUXEDO or not
     */
    public static isTuxedoDevice(): boolean
    {
        if(this.getDmiModelVendor().toLocaleLowerCase() === "tuxedo")
        {
            return true;
        }

        return false;
    }

    public static checkIfNvidiaCardExists(): boolean
    {
        let fs = Environment.getObject("fs");

        if(fs.existsSync("/proc/driver/nvidia/"))
        {
            return true;
        }

        return false;
    }

    /**
     * Check if User root
     *
     * @returns True if user is root, otherwise false
     */
    public static isUserRoot(): boolean
    {
        let process = Environment.getObject("process");
        return process.getuid && process.getuid() === 0;
    }

    /**
     * Create Unit File for systemd
     */
    public static createUnitFile(): void
    {
        let appPath: string = Environment.getObject("appPath");
        let fs = Environment.getObject("fs");
        let path = Environment.getObject("path");

        let unitFilePath: string = path.join(__dirname, "../data/tuxedofancontrol.service");
        let fileContent: string = fs.readFileSync(unitFilePath, "utf8").toString();
        fileContent = fileContent.replace(/%TFCPATH%/gi, appPath);

        fs.writeFileSync(System.SYSTEMD_SERVICE_FILE, fileContent);
    }

    /**
     * Remove systemd Unit file
     */
    public static removeUnitFile(): void
    {
        if(System.existUnitFile())
        {
            Environment.getObject("fs").unlinkSync(System.SYSTEMD_SERVICE_FILE);
        }
    }

    /**
     * Check if systemd unit file is exist
     *
     * @returns True if exist, otherwise false
     */
    public static existUnitFile(): boolean
    {
        return Environment.getObject("fs").existsSync(System.SYSTEMD_SERVICE_FILE);
    }

    /**
     * Write a message in the log file
     *
     * @param message the Message to log
     * @param logPath Path to the log file (Default is System.LOGFILE_PATH)
     * @param startWithSemicolon If True, insert a semicolon ';' at start of message (Default is true)
     * @param logTime If true, insert log time before message
     */
    public static logMessage(message: string, logPath: string = System.LOGFILE_PATH, startWithSemicolon: boolean = true, logTime: boolean = true): void
    {/*
        console.log(message);
        if(startWithSemicolon)
        {
            message = "; " + message;
        }

        if(logTime)
        {
            Environment.getObject("fs").writeFileSync(logPath, new Date().toISOString() + message + "\n", { flag: "a" });
        }
        else
        {
            Environment.getObject("fs").writeFileSync(logPath, message + "\n", { flag: "a" });
        }*/
    }

    /**
     * Starts the Daemon over systemd CLI
     */
    public static startDaemon(): void
    {
        try
        {
            let child_process = Environment.getObject("child_process");
            child_process.execSync("systemctl start " + this.SYSTEMD_SERVICE_NAME);
        }
        catch(error)
        {
            this.logMessage("Error at start daemon over systemd. Error: " + error);
        }
    }

    /**
     * Stops the Daemon over systemd CLI
     */
    public static stopDaemon(): void
    {
        try
        {
            let child_process = Environment.getObject("child_process");
            child_process.execSync("systemctl stop " + this.SYSTEMD_SERVICE_NAME);
        }
        catch(error)
        {
            this.logMessage("Error at stop daemon over systemd. Error: " + error);
        }
    }

    /**
     * Restarts the Daemon over systemd CLI
     */
    public static restartDaemon(): void
    {
        try
        {
            let child_process = Environment.getObject("child_process");
            child_process.execSync("systemctl restart " + this.SYSTEMD_SERVICE_NAME);
        }
        catch(error)
        {
            this.logMessage("Error at restart daemon over systemd. Error: " + error);
        }
    }

    /**
     * Sleep function
     * 
     * @param milliseconds Sleeptime in milliseconds
     */
    public static Sleep(milliseconds) 
    {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }
    
    public static getDistribution(relaseTextContent: string = ""): string
    {
        let distibution: string = "UNKNOW";
        let searchPattern: string = "NAME=";

        if(relaseTextContent === "")
        {
            relaseTextContent = Environment.getObject("fs").readFileSyncString("/etc/os-release");
        }

        for(let line of relaseTextContent.split("\n"))
        {
            if(line.startsWith(searchPattern))
            {
                distibution = line.substring(searchPattern.length, line.length);
            }
        }

        if(distibution.startsWith("\""))
        {
            distibution = distibution.substring(1, distibution.length);
        }

        if(distibution.endsWith("\""))
        {
            distibution = distibution.substring(0, distibution.length - 1);
        }

        return distibution;
    }

    public static getDistributionId(relaseTextContent: string = ""): string
    {
        let distibution: string = "UNKNOW";
        let searchPattern: string = "ID=";

        if(relaseTextContent === "")
        {
            relaseTextContent = Environment.getObject("fs").readFileSyncString("/etc/os-release");
        }

        for(let line of relaseTextContent.split("\n"))
        {
            if(line.startsWith(searchPattern))
            {
                distibution = line.substring(searchPattern.length, line.length);
            }
        }

        if(distibution.startsWith("\""))
        {
            distibution = distibution.substring(1, distibution.length);
        }

        if(distibution.endsWith("\""))
        {
            distibution = distibution.substring(0, distibution.length - 1);
        }

        return distibution;
    }

    public static getDistributionVersion(relaseTextContent: string = ""): string
    {
        let version: string = "UNKNOW";
        let searchPattern: string = "VERSION_ID=";

        if(relaseTextContent === "")
        {
            relaseTextContent = Environment.getObject("fs").readFileSyncString("/etc/os-release");
        }

        for(let line of relaseTextContent.split("\n"))
        {
            if(line.startsWith(searchPattern))
            {
                version = line.substring(searchPattern.length, line.length);
            }
        }

        if(version.startsWith("\""))
        {
            version = version.substring(1, version.length);
        }

        if(version.endsWith("\""))
        {
            version = version.substring(0, version.length - 1);
        }

        return version;
    }
}
