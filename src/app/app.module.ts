import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { Environment } from "../common/environment";
import { System } from '../common/system';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule
{
    constructor()
    {
        Environment.setDaemonMode(false);

        Environment.setEnvironmentVariable("fs", (<any>window).require("fs"), "electron");
        Environment.setEnvironmentVariable("os", (<any>window).require("os"), "electron");
        Environment.setEnvironmentVariable("path", (<any>window).require("path"), "electron");
        Environment.setEnvironmentVariable("child_process", (<any>window).require("child_process"), "electron");
        Environment.setEnvironmentVariable("ec_access", (<any>window).require("../modules/ec_access.node"), "electron");
        Environment.setEnvironmentVariable("process", (<any>window).require("process"), "electron");
        Environment.setEnvironmentVariable("isUserRoot", System.isUserRoot(), "electron");
        Environment.setEnvironmentVariable("appPath", (<any>window).require('electron').remote.app.getAppPath(), "electron");
    }
}
