import { System } from "./system";
import { Environment } from "./environment";

export enum FAN
{
    CPUDATA = 1,
    GPUONEDATA = 2,
    GPUTWODATA = 3
}

export class FanInforamtion
{
    fanId: number;
    remoteTemp: number;
    localTemp: number;
    fanDuty: number;
    rawFanDuty: number;
    rpm: number;
}

export function getFanInformation(fan: number): FanInforamtion
{
    const ec_access = Environment.getObject("ec_access");
    let fanInformations: FanInforamtion = new FanInforamtion();
    fanInformations.fanId = fan;
    fanInformations.remoteTemp = ec_access.getRemoteTemp(fan);
    fanInformations.localTemp = ec_access.getLocalTemp(fan);
    fanInformations.rawFanDuty = ec_access.getRawFanDutyNew(fan);
    fanInformations.fanDuty = (fanInformations.rawFanDuty / 255) * 100;
    fanInformations.rpm = ec_access.getFanRpm(fan);

    return fanInformations;
}

export function getTempRemote(fan: number): number
{
    try
    {
        const ec_access = Environment.getObject("ec_access");
        let temp = ec_access.getRemoteTemp(fan);
        return temp;
    }
    catch (error)
    {
        console.log("getTemp (Index: " + fan + ") Error: " + error);
        return 0;
    }
}

export function getTempLocal(fan: FAN): number
{
    try
    {
        const ec_access = Environment.getObject("ec_access");
        return ec_access.getLocalTemp(fan);
    }
    catch (error)
    {
        console.log("getTemp (Index: " + fan + ") Error: " + error);
        return 0;
    }
}


export function getFanDuty(fan: FAN): number
{
    try
    {
        const ec_access = Environment.getObject("ec_access");
        return ((ec_access.getRawFanDutyNew(fan) / 255) * 100);
    }
    catch (error)
    {
        console.log("getFanDuty (Index: " + fan + ") Error: " + error);
        return 0;
    }
}

export function getRpm(fan: FAN): number
{
    try
    {
        const ec_access = Environment.getObject("ec_access");
        //return ec_access.getFanDutyNew(fan);
        return ec_access.getFanRpm(fan);
    }
    catch (error)
    {
        console.log("getFanRpm (Index: " + fan + ") Error: " + error);
        return 0;
    }
}


export function getRawFanDuty(fan: FAN): number
{
    try
    {
        const ec_access = Environment.getObject("ec_access");
        return ec_access.getRawFanDutyNew(fan);
    }
    catch (error)
    {
        console.log("getRawFanDuty (Index: " + fan + ") Error: " + error);
        return 0;
    }
}

/**
 * Set the CPU Fan Duty
 *
 * @param value CPU Fan Duty Value in percent
 *
 * @returns A boolean, thats indication if the operation successful (true) or not (false)
 */
export function setCpuFanDuty(value: number): boolean
{
    try
    {
        const ec_access = Environment.getObject("ec_access");
        let result = ec_access.setCpuFanDuty(value);

        return result;
    }
    catch (error)
    {
        console.log("setCpuFanDuty Error: " + error);
        return false;
    }
}

/**
 * Set the GPU Fan Duty
 *
 * @param value GPU Fan Duty Value in percent
 *
 * @returns A boolean, thats indication if the operation successful (true) or not (false)
 */
export function setGpuFanDuty(value: number): boolean
{
    try
    {
        const ec_access = Environment.getObject("ec_access");
        let result = ec_access.setGpuFanDuty(value);

        return result;
    }
    catch (error)
    {
        console.log("setGpuFanDuty Error: " + error);
        Environment.getObject("log")("setGpuFanDuty error: " + error);

        return false;
    }
}