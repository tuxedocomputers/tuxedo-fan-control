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
    let fs: any = Environment.getObject("fs");
    let path: any = Environment.getObject("path");
    let fanTablesFilePath: string = "../data/fantables.json";
    fanTablesFilePath = path.join(__dirname, fanTablesFilePath);
    if (process.env.TUXEDO_FAN_TABLE_FILE) {
        fs.writeFileSync(
            System.LOGFILE_PATH,
            new Date().toISOString() + ' use TUXEDO_FAN_TABLE_FILE: ' + process.env.TUXEDO_FAN_TABLE_FILE + '\n',
            {flag: "a"}
        );
        fanTablesFilePath = process.env.TUXEDO_FAN_TABLE_FILE;
    }

    let tables = new Array<FanTable>();

    fs.writeFileSync(System.LOGFILE_PATH, new Date().toISOString() + " Read fan table\n", { flag: "a" });
    let content: string = fs.readFileSync(fanTablesFilePath).toString();

    tables = JSON.parse(content);
    return tables;
}
