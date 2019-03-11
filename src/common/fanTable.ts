import { Environment } from "./environment";
import { System } from "./system";

export class FanTable
{
    model: string;
    hasGpu: boolean;
    defaultFanDutyCpu: number;
    defaultFanDutyGpu: number;
    cpuMinTemp: number;
    cpuMaxTemp: number;
    gpuMinTemp: number;
    gpuMaxTemp: number;
    cpuTable: TemperaturEntry[];
    gpuTable: TemperaturEntry[];
}

export class TemperaturEntry
{
    temp: number;
    duty: number;
}

/**
 * Read and returns a FanTable Array
 *
 * @returns a Array of FanTable
 */
export function readFanTables(): FanTable[]
{
    let fanTablesFilePath: string = "../data/fantables.json";
    let fs: any = Environment.getObject("fs");
    let path: any = Environment.getObject("path");
    let tables = new Array<FanTable>();

    fs.writeFileSync(System.LOGFILE_PATH, new Date().toISOString() + " Read fan table\n", { flag: "a" });
    let content = fs.readFileSync(path.join(__dirname, fanTablesFilePath)).toString()

    tables = JSON.parse(content);
    return tables;
}
