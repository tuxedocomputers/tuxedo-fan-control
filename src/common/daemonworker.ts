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

            let cpuInformations = EC.getFanInformation(EC.FAN.CPUDATA);
            let gpuOneInformations: EC.FanInforamtion;
            let gpuTwoInformations: EC.FanInforamtion;

            let cpuSetDuty: number = -1;
            let gpuOneSetDuty: number = -1;
            let gpuTwoSetDuty: number = -1;

            if(cpuInformations.remoteTemp >= modelInformations.cpuMinTemp && cpuInformations.remoteTemp <= modelInformations.cpuMaxTemp)
            {
                cpuSetDuty = modelInformations.cpuTable.find(x => x.temp == cpuInformations.remoteTemp).duty;
            }
            else if(cpuInformations.remoteTemp < modelInformations.cpuMinTemp)
            {
                cpuSetDuty = modelInformations.defaultFanDutyCpu;
            }

            await System.Sleep(100);

            if(hasGpu)
            {
                gpuOneInformations = EC.getFanInformation(EC.FAN.GPUONEDATA);

                if(gpuOneInformations.remoteTemp >= modelInformations.gpuMinTemp && gpuOneInformations.remoteTemp <= modelInformations.gpuMaxTemp)
                {
                    gpuOneSetDuty = modelInformations.gpuTable.find(x => x.temp == gpuOneInformations.remoteTemp).duty;
                }
                else if(gpuOneInformations.remoteTemp < modelInformations.gpuMinTemp)
                {
                    gpuOneSetDuty = modelInformations.defaultFanDutyGpu;
                }

                await System.Sleep(100);

                gpuTwoInformations = EC.getFanInformation(EC.FAN.GPUTWODATA);

                if(gpuTwoInformations.remoteTemp >= modelInformations.gpuMinTemp && gpuTwoInformations.remoteTemp <= modelInformations.gpuMaxTemp)
                {
                    gpuTwoSetDuty = modelInformations.gpuTable.find(x => x.temp == gpuTwoInformations.remoteTemp).duty;
                }
                else if(gpuTwoInformations.remoteTemp < modelInformations.gpuMinTemp)
                {
                    gpuTwoSetDuty = modelInformations.defaultFanDutyGpu;
                }

                await System.Sleep(100);
            }

            System.logMessage("CPU Temp is '" + cpuInformations.remoteTemp.toString() + "' Grad, fan duty: " + cpuInformations.fanDuty.toString(), System.LOGFILE_PATH_DAEMON);
            if(cpuInformations.remoteTemp > 1 && cpuInformations.remoteTemp <= modelInformations.cpuMaxTemp)
            {
                System.logMessage("Change CPU Duty", System.LOGFILE_PATH_DAEMON);
                System.logMessage("Last: '" + lastSetCpuDuty.toString() + "' Current: '" + cpuSetDuty.toString(), System.LOGFILE_PATH_DAEMON);
                System.logMessage("Set GPU Duty on " + cpuSetDuty.toString(), System.LOGFILE_PATH_DAEMON);
                
                let value: number = Math.round((255/100) * cpuSetDuty);

                EC.setFanDuty(EC.FAN.CPUDATA, value);

                lastSetCpuDuty = cpuSetDuty;

                await System.Sleep(100);
            }

            if(hasGpu)
            {
                System.logMessage("Start set GPU fans", System.LOGFILE_PATH_DAEMON);

                System.logMessage("GPU One Temp is '" + gpuOneInformations.remoteTemp.toString() + "' Grad, fan duty: " + gpuOneInformations.fanDuty.toString(), System.LOGFILE_PATH_DAEMON);
                if(gpuOneInformations.remoteTemp > 1 && gpuOneInformations.remoteTemp <= modelInformations.gpuMaxTemp)
                {
                    System.logMessage("Change GPU One Duty", System.LOGFILE_PATH_DAEMON);
                    System.logMessage("Last: '" + lastSetGpuOneDuty.toString() + "' Current: '" + gpuOneSetDuty.toString(), System.LOGFILE_PATH_DAEMON);
                    System.logMessage("Set GPU Duty One on " + gpuOneSetDuty.toString(), System.LOGFILE_PATH_DAEMON);

                    let value: number = Math.round((255/100) * gpuOneSetDuty);

                    EC.setFanDuty(EC.FAN.GPUONEDATA, value);

                    lastSetGpuOneDuty = gpuOneSetDuty;

                    await System.Sleep(100);
                }

                System.logMessage("GPU Two Temp is '" + gpuTwoInformations.remoteTemp.toString() + "' Grad, fan duty: " + gpuTwoInformations.fanDuty.toString(), System.LOGFILE_PATH_DAEMON);
                if(gpuTwoInformations.remoteTemp > 1 && gpuTwoInformations.remoteTemp <= modelInformations.gpuMaxTemp)
                {
                    System.logMessage("Change GPU Two Duty", System.LOGFILE_PATH_DAEMON);
                    System.logMessage("Last: '" + lastSetGpuTwoDuty.toString() + "' Current: '" + gpuTwoSetDuty.toString(), System.LOGFILE_PATH_DAEMON);
                    System.logMessage("Set GPU Duty Two on " + gpuTwoSetDuty.toString(), System.LOGFILE_PATH_DAEMON);

                    let value: number = Math.round((255/100) * gpuTwoSetDuty);
                
                    EC.setFanDuty(EC.FAN.GPUTWODATA, value);

                    lastSetGpuTwoDuty = gpuTwoSetDuty;

                    await System.Sleep(100);
                }

                System.logMessage("End set GPU fans", System.LOGFILE_PATH_DAEMON);
            }
            
            await System.Sleep(1000);
        }
    }
}
