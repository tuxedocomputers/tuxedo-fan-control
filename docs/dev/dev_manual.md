<!-- TOC -->

- [Building](#building)
- [Hidden Start Parameters](#hidden-start-parameters)
    - [--debugfan](#debugfan)
    - [--daemon](#daemon)
    - [--expert](#expert)
    - [--novendorcheck](#novendorcheck)
- [Paths and Names](#paths-and-names)
- [Known Issues](#known-issues)

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

## --novendorcheck
Disable the Vendor Check. Use at your own risk for non TUXEDO devices.

# Paths and Names

| File                  | Path                                          |
|-----------------------|-----------------------------------------------|
| systemd Service File  | /etc/systemd/system/tuxedofancontrol.service  |
| systemd Service Name  | tuxedofancontrol                              |
| Log File              | /var/log/tuxedo-fan/tuxedo-fan.log            |
| Log File Daemon       | /var/log/tuxedo-fan/tuxedo-fan-daemon.log     |
| PID File              | /var/run/tuxedo-fan-daemon.pid                |
| Install Dir           | /opt/tuxedofancontrol/tuxedofancontrol        |
| Bin Symlink           | /usr/bin/tuxedofancontrol                     |

# Known Issues

