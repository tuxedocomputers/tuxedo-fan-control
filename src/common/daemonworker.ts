import * as fs from "fs";
import { System } from "./system";
import * as FanTable from "./fanTable";
import * as EC from "./ec_access";

/**
 * The DaemonWorker contains the Daemon logic
 */
export class DaemonWorker
{
    /**
     * Startup logic for the daemon
     */
    public static async start()
    {
        let log_date: any = new Date().toISOString();
        System.logMessage("daemon worker start: " + log_date, System.LOGFILE_PATH_DAEMON, false);

        let model = System.getDmiModelName();
        let fanTable = FanTable.readFanTables();

        System.logMessage("check fantable", System.LOGFILE_PATH_DAEMON);
        if(fanTable === undefined || fanTable === null)
        {
            System.logMessage("; Model '" + model + "' not found in fan table. Exit Deamon\n", System.LOGFILE_PATH_DAEMON);
            return;
        }

        let modelInformations = fanTable.find(x => x.model === model || x.model === "XXALLXX");

        System.logMessage("Model: '" + modelInformations.model + "' found in fan table.\n", System.LOGFILE_PATH_DAEMON);
        System.logMessage("cpuMinTemp: '" + modelInformations.cpuMinTemp, System.LOGFILE_PATH_DAEMON);
        System.logMessage("cpuMaxTemp: '" + modelInformations.cpuMaxTemp, System.LOGFILE_PATH_DAEMON);
        System.logMessage("gpuMinTemp: '" + modelInformations.gpuMinTemp, System.LOGFILE_PATH_DAEMON);
        System.logMessage("gpuMaxTemp: '" + modelInformations.gpuMaxTemp, System.LOGFILE_PATH_DAEMON);

        let lastSetCpuDuty: number = 0;
        let lastSetGpuDuty: number = 0;
        let hasGpu = modelInformations.hasGpu && System.isNvidiaSmiInstalled();

        while(true)
        {
            System.logMessage("\n", System.LOGFILE_PATH_DAEMON, false, false);

            let cpuTemp = EC.getTempRemote(EC.FAN.CPUDATA);
            let cpuSetDuty: number = -1;

            let gpuTemp: number = -1;
            let gpuSetDuty: number = -1;

            if(cpuTemp >= modelInformations.cpuMinTemp && cpuTemp <= modelInformations.cpuMaxTemp)
            {
                cpuSetDuty = modelInformations.cpuTable.find(x => x.temp == cpuTemp).duty;
            }
            else if(cpuTemp < modelInformations.cpuMinTemp)
            {
                cpuSetDuty = modelInformations.defaultFanDutyCpu;
            }

            if(hasGpu)
            {
                gpuTemp = System.getNvidiaTemperature();

                if(gpuTemp >= modelInformations.gpuMinTemp && gpuTemp <= modelInformations.gpuMaxTemp)
                {
                    gpuSetDuty = modelInformations.gpuTable.find(x => x.temp == gpuTemp).duty;
                }
                else if(gpuTemp < modelInformations.gpuMinTemp)
                {
                    gpuSetDuty = modelInformations.defaultFanDutyGpu;
                }
            }

            System.logMessage("Current CPU Temp is " + cpuTemp.toString(), System.LOGFILE_PATH_DAEMON);
            if(lastSetCpuDuty !== cpuSetDuty && cpuTemp >= modelInformations.cpuMinTemp && cpuTemp <= modelInformations.cpuMaxTemp)
            {
                System.logMessage("Change CPU Duty", System.LOGFILE_PATH_DAEMON);
                System.logMessage("Last: '" + lastSetCpuDuty.toString() + "' Current: '" + cpuSetDuty.toString(), System.LOGFILE_PATH_DAEMON);
                System.logMessage("Set GPU Duty on " + cpuSetDuty.toString(), System.LOGFILE_PATH_DAEMON);

                EC.setCpuFanDuty(cpuSetDuty);

                lastSetCpuDuty = cpuSetDuty;
            }

            System.logMessage("Current GPU Temp is " + gpuTemp.toString(), System.LOGFILE_PATH_DAEMON);
            if(lastSetGpuDuty !== gpuSetDuty && gpuTemp >= modelInformations.gpuMinTemp && gpuTemp <= modelInformations.gpuMaxTemp)
            {
                System.logMessage("Change GPU Duty", System.LOGFILE_PATH_DAEMON);
                System.logMessage("Last: '" + lastSetGpuDuty.toString() + "' Current: '" + gpuSetDuty.toString(), System.LOGFILE_PATH_DAEMON);
                System.logMessage("Set GPU Duty on " + gpuSetDuty.toString(), System.LOGFILE_PATH_DAEMON);

                EC.setGpuFanDuty(gpuSetDuty);

                lastSetGpuDuty = gpuSetDuty;
            }

            await this.sleep(1000);
        }
    }

    /**
     * Sleep function
     *
     * @param ms Milliseconds to sleep
     */
    private static sleep(ms: number)
    {
        return new Promise(resolve => {
            setTimeout(resolve,ms);
        });
    }
}
