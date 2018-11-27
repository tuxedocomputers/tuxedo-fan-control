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
        let lastSetGpuOneDuty: number = 0;
        let lastSetGpuTwoDuty: number = 0;
        let hasGpu = modelInformations.hasGpu && System.checkIfNvidiaCardExists();

        while(true)
        {
            System.logMessage("\n", System.LOGFILE_PATH_DAEMON, false, false);

            let cpuTemp = EC.getRemoteTemp(EC.FAN.CPUDATA);
            let gpuOneTemp: number = -1;
            let gpuTwoTemp: number = -1;

            let cpuSetDuty: number = -1;
            let gpuOneSetDuty: number = -1;
            let gpuTwoSetDuty: number = -1;

            if(cpuTemp >= modelInformations.cpuMinTemp && cpuTemp <= modelInformations.cpuMaxTemp)
            {
                cpuSetDuty = modelInformations.cpuTable.find(x => x.temp == cpuTemp).duty;
            }
            else if(cpuTemp < modelInformations.cpuMinTemp)
            {
                cpuSetDuty = modelInformations.defaultFanDutyCpu;
            }

            await System.Sleep(100);

            if(hasGpu)
            {
                gpuOneTemp = EC.getRemoteTemp(EC.FAN.GPUONEDATA);

                if(gpuOneTemp >= modelInformations.gpuMinTemp && gpuOneTemp <= modelInformations.gpuMaxTemp)
                {
                    gpuOneSetDuty = modelInformations.gpuTable.find(x => x.temp == gpuOneTemp).duty;
                }
                else if(gpuOneTemp < modelInformations.gpuMinTemp)
                {
                    gpuOneSetDuty = modelInformations.defaultFanDutyGpu;
                }

                await System.Sleep(100);

                gpuTwoTemp = EC.getRemoteTemp(EC.FAN.GPUTWODATA);

                if(gpuTwoTemp >= modelInformations.gpuMinTemp && gpuTwoTemp <= modelInformations.gpuMaxTemp)
                {
                    gpuTwoSetDuty = modelInformations.gpuTable.find(x => x.temp == gpuTwoTemp).duty;
                }
                else if(gpuTwoTemp < modelInformations.gpuMinTemp)
                {
                    gpuTwoSetDuty = modelInformations.defaultFanDutyGpu;
                }

                await System.Sleep(100);
            }

            System.logMessage("Current CPU Temp is " + cpuTemp.toString(), System.LOGFILE_PATH_DAEMON);
            if(lastSetCpuDuty !== cpuSetDuty && cpuTemp >= modelInformations.cpuMinTemp && cpuTemp <= modelInformations.cpuMaxTemp)
            {
                System.logMessage("Change CPU Duty", System.LOGFILE_PATH_DAEMON);
                System.logMessage("Last: '" + lastSetCpuDuty.toString() + "' Current: '" + cpuSetDuty.toString(), System.LOGFILE_PATH_DAEMON);
                System.logMessage("Set GPU Duty on " + cpuSetDuty.toString(), System.LOGFILE_PATH_DAEMON);
                
                EC.setFanDuty(EC.FAN.CPUDATA, cpuSetDuty);

                lastSetCpuDuty = cpuSetDuty;

                await System.Sleep(100);
            }

            System.logMessage("Current GPU One Temp is " + gpuOneTemp.toString(), System.LOGFILE_PATH_DAEMON);
            if(lastSetGpuOneDuty !== gpuOneSetDuty && gpuOneTemp >= modelInformations.gpuMinTemp && gpuOneTemp <= modelInformations.gpuMaxTemp)
            {
                System.logMessage("Change GPU One Duty", System.LOGFILE_PATH_DAEMON);
                System.logMessage("Last: '" + lastSetGpuOneDuty.toString() + "' Current: '" + gpuOneSetDuty.toString(), System.LOGFILE_PATH_DAEMON);
                System.logMessage("Set GPU Duty One on " + gpuOneSetDuty.toString(), System.LOGFILE_PATH_DAEMON);

                EC.setFanDuty(EC.FAN.GPUONEDATA, gpuOneSetDuty);

                lastSetGpuOneDuty = gpuOneSetDuty;

                await System.Sleep(100);
            }

            System.logMessage("Current GPU Two Temp is " + gpuTwoTemp.toString(), System.LOGFILE_PATH_DAEMON);
            if(lastSetGpuTwoDuty !== gpuTwoSetDuty && gpuTwoTemp >= modelInformations.gpuMinTemp && gpuTwoTemp <= modelInformations.gpuMaxTemp)
            {
                System.logMessage("Change GPU Two Duty", System.LOGFILE_PATH_DAEMON);
                System.logMessage("Last: '" + lastSetGpuTwoDuty.toString() + "' Current: '" + gpuTwoSetDuty.toString(), System.LOGFILE_PATH_DAEMON);
                System.logMessage("Set GPU Duty Two on " + gpuTwoSetDuty.toString(), System.LOGFILE_PATH_DAEMON);

                EC.setFanDuty(EC.FAN.GPUTWODATA, gpuTwoSetDuty);

                lastSetGpuTwoDuty = gpuTwoSetDuty;

                await System.Sleep(100);
            }

            await System.Sleep(1000);
        }
    }
}
