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

/**
 * Read and return the fan informations a return a object of FanInforamtion with the informations
 * 
 * @param fan The Fan Number (1 = CPU, 2 = GPU One, 3 = GPU Two)
 * 
 * @returns A FanInforamtion with the fan informations 
 */
export function getFanInformation(fan: number): FanInforamtion
{
    const ec_access = Environment.getObject("ec_access");
    let fanInformations: FanInforamtion = new FanInforamtion();
    let fd: number = ec_access.nGetRawFanDuty(fan);

    fanInformations.fanId = fan;
    fanInformations.rawFanDuty = fd;
    fanInformations.fanDuty = (fd / 255) * 100;
    fanInformations.remoteTemp = ec_access.nGetRemoteTemp(fan);
    fanInformations.localTemp = ec_access.nGetLocalTemp(fan);
    //fanInformations.rpm = ec_access.nGetFanRpm(fan);

    return fanInformations;
}

/**
 * Reads and return the remote temperature of fan
 * 
 * @param fan The Fan Number (1 = CPU, 2 = GPU One, 3 = GPU Two)
 * 
 * @returns The remote temperature of fan
 */
export function getRemoteTemp(fan: number): number
{
    try
    {
        const ec_access = Environment.getObject("ec_access");
        let temp = ec_access.nGetRemoteTemp(fan);
        return temp;
    }
    catch (error)
    {
        console.log("getTemp (Index: " + fan + ") Error: " + error);
        return 0;
    }
}

/**
 * Reads and return the local temperature of fan
 * 
 * @param fan The Fan Number (1 = CPU, 2 = GPU One, 3 = GPU Two)
 * 
 * @returns The local temperature of fan
 */
export function getLocalTemp(fan: FAN): number
{
    try
    {
        const ec_access = Environment.getObject("ec_access");
        return ec_access.nGetLocalTemp(fan);
    }
    catch (error)
    {
        console.log("getTemp (Index: " + fan + ") Error: " + error);
        return 0;
    }
}

/**
 * Reads and retun the fan duty in percent
 * 
 * @param fan The Fan Number (1 = CPU, 2 = GPU One, 3 = GPU Two)
 * 
 * @returns A number with the fan duty
 */
export function getFanDuty(fan: FAN): number
{
    try
    {
        const ec_access = Environment.getObject("ec_access");
        return ((ec_access.nGetFanDuty(fan) / 255) * 100);
    }
    catch (error)
    {
        console.log("getFanDuty (Index: " + fan + ") Error: " + error);
        return 0;
    }
}

/**
 * Reads and return the fan rpm
 * 
 * @param fan The Fan Number (1 = CPU, 2 = GPU One, 3 = GPU Two)
 * 
 * @returns A number with the fan rpm
 */
export function getFanRpm(fan: FAN): number
{
    try
    {
        const ec_access = Environment.getObject("ec_access");
        return ec_access.nGetFanRpm(fan);
    }
    catch (error)
    {
        console.log("getFanRpm (Index: " + fan + ") Error: " + error);
        return 0;
    }
}

/**
 * Reads an returns the raw fan duty (value 0 - 255)
 * 
 * @param fan The Fan Number (1 = CPU, 2 = GPU One, 3 = GPU Two)
 * 
 * @returns A number with the raw fan duty
 */
export function getRawFanDuty(fan: FAN): number
{
    try
    {
        const ec_access = Environment.getObject("ec_access");
        return ec_access.nGetRawFanDuty(fan);
    }
    catch (error)
    {
        console.log("getRawFanDuty (Index: " + fan + ") Error: " + error);
        return 0;
    }
}

/**
 * Set the Fan Duty
 *
 * @param fan The Fan Number (1 = CPU, 2 = GPU One, 3 = GPU Two)
 * @param value GPU Fan Duty Value in percent
 *
 * @returns A boolean, thats indication if the operation successful (true) or not (false)
 */
export function setFanDuty(fan: number, value: number): boolean
{
    try
    {
        const ec_access = Environment.getObject("ec_access");
        let result = ec_access.nSetFanDuty(fan, value);

        return result;
    }
    catch (error)
    {
        console.log("setFanDuty Error: " + error);
        Environment.getObject("log")("setFanDuty error: " + error);

        return false;
    }
}

/**
 * Set the Fan Duty on Auto mode
 *
 * @param fan The Fan Number (1 = CPU, 2 = GPU One, 3 = GPU Two, 5 = ALL)
 */
export function setAutoFanDuty(fan: number): void
{
    try
    {
        const ec_access = Environment.getObject("ec_access");
        ec_access.nSetAutoFanDuty(fan);
    }
    catch (error)
    {
        console.log("setAutoFanDuty Error: " + error);
        Environment.getObject("log")("setFanDuty error: " + error);
    }
}