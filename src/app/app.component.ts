import { Component, OnInit, OnDestroy } from '@angular/core';
import * as ec_access from "../common/ec_access";
import { System } from "../common/system";
import { Observable, timer } from 'rxjs'
import { readFanTables, FanTable } from '../common/fanTable';
import { Environment } from '../common/environment';
import * as $ from 'jquery';
import "bootstrap";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy
{
    public modelName: string;
    public fanTableInformation: string;
    public gpuInformations: string;
    public informations: string = "--";

    public cpuTemp: number = 0;
    public cpuFanDuty: number = 0;
    // public cpuFanRpm: number = 0;

    public gpuOneTemp: number = 0;
    public gpuOneFanDuty: number = 0;
    // public gpuOneFanRpm: number = 0;

    public gpuTwoTemp: number = 0;
    public gpuTwoFanDuty: number = 0;
    // public gpuTwoFanRpm: number = 0;

    public canCpuDutyChange: boolean = true;
    public canGpuDutyChange: boolean = true;

    private _fanTable: FanTable;

    public isDaemonRunning: boolean = false;
    public isUserRoot: boolean = true;

    public canCreateUnitFile: boolean = true;
    public canInteractWithUnitFile: boolean = true;
    public expertMode: boolean = false;

    public nvidaCardExists: boolean = false;

    private _updateValuesWorker: any;

    ngOnInit(): void
    {
        if(!Environment.getObject("isUserRoot"))
        {
            this.informations = "User is not root, please restart with root privileges";
            this.canInteractWithUnitFile = this.canCreateUnitFile = this.isUserRoot = false;
            return;
        }

        if(Environment.getObject("vendorcheck") && !System.isTuxedoDevice())
        {
            $("#notuxedomodal").modal("toggle");
            this.informations = "No TUXEDO device";
            return;
        }

        this.expertMode = Environment.getObject("expertMode");

        this.nvidaCardExists = System.checkIfNvidiaCardExists();
        System.logMessage("Nvidia Card Exist: " + this.nvidaCardExists);

        System.logMessage("AppComponent - ngOnInit - Setup logic");

        this.modelName = System.getDmiModelName();
        this.setValues();
        this._updateValuesWorker = timer(1000, 1000);
        this._updateValuesWorker.subscribe(x => this.setValues());

        this._fanTable = readFanTables().find(x => x.model === this.modelName || x.model === "XXALLXX");

        if(this._fanTable !== undefined)
        {
            System.logMessage("AppComponent - ngOnInit - Fan Table found");
            this.fanTableInformation = "Fan Table found";
        }
        else
        {
            System.logMessage("AppComponent - ngOnInit - No Fan Table found");
            this.fanTableInformation = "No Fan Table found";
        }

        if(this.nvidaCardExists)
        {
            if(this._fanTable.hasGpu)
            {
                System.logMessage("AppComponent - ngOnInit - GPU Fan Table exist");
                this.gpuInformations = "GPU Fan Table exist";
            }
            else
            {
                System.logMessage("AppComponent - ngOnInit - NO GPU Fan Table exist");
                this.gpuInformations = "NO GPU Fan Table exist";
            }
        }
        else
        {
            this.gpuInformations = "No GPU exist"
        }
    }

    ngOnDestroy(): void
    {
        System.logMessage("AppComponent - ngOnDestroy - unsubscribe");
        this._updateValuesWorker.unsubscribe();
    }

    private async setValues()
    {
        console.log("begin setValues");
        this.informations = "";
        this.isDaemonRunning = !(<any>window).require("../common/daemon").isDaemonRunning();

        this.canInteractWithUnitFile = System.existUnitFile() && this.isUserRoot;
        this.canCreateUnitFile = !this.canInteractWithUnitFile;

        this.canCpuDutyChange = this.canGpuDutyChange = this.isDaemonRunning;
        this.informations = !this.isDaemonRunning ? "Daemon is running" : "Daemon is stopped";

        let cpuInfos: ec_access.FanInforamtion = ec_access.getFanInformation(ec_access.FAN.CPUDATA);

        if(cpuInfos.remoteTemp != 1)
        {
            this.cpuTemp = cpuInfos.remoteTemp;
        }

        this.cpuFanDuty = Math.round(cpuInfos.fanDuty);
        // this.cpuFanRpm = cpuInfos.rpm;

        if(this.cpuTemp >= 70)
        {
            if(this.informations === "")
            {
                this.informations += "High CPU Temperature";
            }
            else
            {
                this.informations += ", High CPU Temperature";
            }
        }

        await System.Sleep(100);

        if(this.nvidaCardExists)
        {
            let gpuOneInfos: ec_access.FanInforamtion = ec_access.getFanInformation(ec_access.FAN.GPUONEDATA);

            if(gpuOneInfos.remoteTemp != 1)
            {
                this.gpuOneTemp = gpuOneInfos.remoteTemp;
            }
            
            this.gpuOneFanDuty = Math.round(gpuOneInfos.fanDuty);
            // this.gpuOneFanRpm = gpuOneInfos.rpm;

            if(this.gpuOneTemp >= 70)
            {
                if(this.informations === "")
                {
                    this.informations += "High GPU 1 Temperature";
                }
                else
                {
                    this.informations += ", High GPU 1 Temperature";
                }
            }

            await System.Sleep(100);

            let gpuTwoInfos: ec_access.FanInforamtion = ec_access.getFanInformation(ec_access.FAN.GPUTWODATA);

            if(gpuTwoInfos.remoteTemp != 1)
            {
                this.gpuTwoTemp = gpuTwoInfos.remoteTemp;
            }
            
            this.gpuTwoFanDuty = Math.round(gpuTwoInfos.fanDuty);
            // this.gpuTwoFanRpm = gpuTwoInfos.rpm;

            if(this.gpuTwoTemp >= 70)
            {
                if(this.informations === "")
                {
                    this.informations += "High GPU 2 Temperature";
                }
                else
                {
                    this.informations += ", High GPU 2 Temperature";
                }
            }

            await System.Sleep(100);
        }
    }

    public setFanDuty(fan: number, valueString: string): void
    {
        System.logMessage("AppComponent - setFanDuty - start");

        System.logMessage("AppComponent - setFanDuty - parse value");
        let value: number = Number.parseInt(valueString);

        System.logMessage("AppComponent - setFanDuty - set for value fan (" + fan.toString() + ") duty on: " + value);
        if(value < 1 || value > 255)
        {
            System.logMessage("AppComponent - setFanDuty - Invalid Duty Speed! Possible values are between 1 and 255");
            this.informations = "Invalid Duty Speed! Possible values are between 1 and 255";
            return;
        }

        try
        {
            System.logMessage("AppComponent - setFanDuty - set fan duty");
            let result = ec_access.setFanDuty(fan, value);
            System.logMessage("AppComponent - setFanDuty - result: " + result);
        }
        catch (error)
        {
            System.logMessage("AppComponent - setFanDuty - Error at setting Fan Duty. " + error);
            this.informations = "Error at setting Fan Duty. " + error;
        }
    }

    public setAutoFanDuty(fan: number): void
    {
        System.logMessage("AppComponent - setAutoFanDuty - start");

        try
        {
            System.logMessage("AppComponent - setAutoFanDuty - set fan duty");
            ec_access.setAutoFanDuty(fan);
        }
        catch (error)
        {
            System.logMessage("AppComponent - setAutoFanDuty - Error at setting Fan Duty. " + error);
            this.informations = "Error at setting Auto Fan Duty. " + error;
        }
    }

    public openLink(url: string): void
    {
        (<any>window).require('electron').shell.openExternal(url);
    }

    public createUnitFile(): void
    {
        System.logMessage("AppComponent - createUnitFile");
        System.createUnitFile();
    }

    public removeUnitFile(): void
    {
        System.logMessage("AppComponent - removeUnitFile");
        System.removeUnitFile();
    }

    public startDaemon(): void
    {
        System.logMessage("AppComponent - startDaemon");
        System.startDaemon();
    }

    public stopDaemon(): void
    {
        System.logMessage("AppComponent - stopDaemon");
        System.stopDaemon();
    }

    public restartDaemon(): void
    {
        System.logMessage("AppComponent - restartDaemon");
        System.restartDaemon();
    }

    public closeApplication(): void
    {
        (<any>window).require("electron").remote.getCurrentWindow().close();
    }
}