#!/bin/bash

if [ "`systemctl is-active tuxedofancontrol.service`" == "active" ]; then
    systemctl stop tuxedofancontrol
fi

if [ "`systemctl is-enabled tuxedofancontrol.service`" == "enabled" ]; then
    systemctl disable tuxedofancontrol
fi

if [ -d "/opt/tuxedofancontrol/tuxedofancontrol" ]; then
    Xvfb :99 & export DISPLAY=:99 && /opt/tuxedofancontrol/tuxedofancontrol --removeunitfile
fi

if [ -f "/usr/bin/tuxedofancontrol" ]; then
    rm /usr/bin/tuxedofancontrol
fi

if [ -f "/etc/systemd/system/tuxedofancontrol.service" ]; then
    rm /etc/systemd/system/tuxedofancontrol.service
fi

rm -rf /var/log/tuxedo-fan/
