import { System } from "./system";
import { Environment } from "./environment";

export enum FAN
{
    CPUDATA = 1,
    GPUONEDATA = 2,
    GPUTWODATA = 3
}

export function getTempRemote(fan: number): number
{
    try
    {
        const ec_access = Environment.getObject("ec_access");
        let temp = ec_access.getRemoteTemp(2);
        console.log("getTempRemote: " + temp);
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
        return ec_access.GetLocalTemp(fan);
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
        return ((ec_access.getRawFanDutyNew(fan) / 255) * 100) + 0.5;
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
 * Get the CPU temperature
 *
 * @returns Returns an number with the CPU temperature in Grad Celsius
 */
export function getCpuTemp(): number
{
    try
    {
        const ec_access = Environment.getObject("ec_access");
        return ec_access.getCpuTemp();
    }
    catch (error)
    {
        console.log("getCpuTemp Error: " + error);
        return 0;
    }
}

/**
 * Get the CPU fan duty
 *
 * @returns A number with CPU fan duty in percent
 */
export function getCpuFanDuty(): number
{
    try
    {
        const ec_access = Environment.getObject("ec_access");
        return ec_access.getCpuFanDuty();
    }
    catch (error)
    {
        console.log("getCpuFanDuty Error: " + error);
        return 0;
    }
}

/**
 * Get the raw CPU fan duty (raw value from EC)
 *
 * @returns A number with raw CPU fan duty
 */
export function getRawCpuFanDuty(): number
{
    try
    {
        const ec_access = Environment.getObject("ec_access");
        return ec_access.getRawCpuFanDuty();
    }
    catch (error)
    {
        console.log("getRawCpuFanDuty Error: " + error);
        return 0;
    }
}

/**
 * Get the CPU fan RPM value
 *
 * @returns A number with CPU fan rpm
 */
export function getCpuFanRpm(): number
{
    try
    {
        const ec_access = Environment.getObject("ec_access");
        return ec_access.getCpuFanRpm();
    }
    catch (error)
    {
        console.log("getCpuFanRpm Error: " + error);
        return 0;
    }
}

/**
 * Get the GPU temperature
 *
 * @returns Returns an number with the GPU temperature in Grad Celsius
 */
export function getGpuTemp(): number
{
    try
    {
        const ec_access = Environment.getObject("ec_access");
        return ec_access.getGpuTemp();
    }
    catch (error)
    {
        console.log("getGpuTemp Error: " + error);
        return 0;
    }
}

/**
 * Get the GPU fan duty
 *
 * @returns A number with GPU fan duty in percent
 */
export function getGpuFanDuty(): number
{
    try
    {
        const ec_access = Environment.getObject("ec_access");
        return ec_access.getGpuFanDuty();
    }
    catch (error)
    {
        console.log("getGpuFanDuty Error: " + error);
        return 0;
    }
}

/**
 * Get the raw GPU fan duty (raw value from EC)
 *
 * @returns A number with raw GPU fan duty
 */
export function getRawGpuFanDuty(): number
{
    try
    {
        const ec_access = Environment.getObject("ec_access");
        return ec_access.getRawGpuFanDuty();
    }
    catch (error)
    {
        console.log("getRawGpuFanDuty Error: " + error);
        return 0;
    }
}

/**
 * Get the GPU fan RPM value
 *
 * @returns A number with GPU fan rpm
 */
export function getGpuFanRpm(): number
{
    try
    {
        const ec_access = Environment.getObject("ec_access");
        return ec_access.getGpuFanRpm();
    }
    catch (error)
    {
        console.log("getGpuFanRpm Error: " + error);
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