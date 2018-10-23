<!-- TOC -->

- [Building](#building)
- [Hidden Start Parameters](#hidden-start-parameters)
    - [--debugfan](#--debugfan)
    - [--daemon](#--daemon)
    - [--expert](#--expert)
- [Paths and Names](#paths-and-names)
- [Known Issues](#known-issues)
    - [Control more as One GPU Fan](#control-more-as-one-gpu-fan)
    - [Default Fan Mode](#default-fan-mode)

<!-- /TOC -->

# Building

Dependencies
- Node.js (Version >=10)
- gcc

# Hidden Start Parameters

## --debugfan
With this Parameter start the TUXEDO Fan Control with the Chrome Developer Tools.

## --daemon
With this Parameter starts the TUXEDO Fan Control in the Daemon Mode.

## --expert
With this Parameter can set custom fan duty in UI.

# Paths and Names

| File                  | Path                                          |
|-----------------------|-----------------------------------------------|
| systemd Service File  | /lib/systemd/system/tuxedofancontrol.service  |
| systemd Service Name  | tuxedofancontrol                              |
| Log File              | /var/log/tuxedo-fan/tuxedo-fan.log            |
| Log File Daemon       | /var/log/tuxedo-fan/tuxedo-fan-daemon.log     |
| PID File              | /var/run/tuxedo-fan-daemon.pid                |
| Install Dir           | /opt/tuxedofancontrol/tuxedofancontrol        |
| Bin Symlink           | /usr/bin/tuxedofancontrol                     |

# Known Issues

## Control more as One GPU Fan
We can currently control only one fan from the Nvidia graphic cards (If the graphic card have multiple fans)

## Default Fan Mode
Currently cannot set to the default fan mode from the software side. You can reset the fan control over FN+1 or restart your device (Check if the daemon / systemd service is not running).

