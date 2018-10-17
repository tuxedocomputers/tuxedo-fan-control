#!/bin/bash

rm /usr/share/applications/tuxedofancontrol.desktop

Xvfb :99 & export DISPLAY=:99 && /opt/tuxedofancontrol/tuxedofancontrol --createunitfile
ln -s /opt/tuxedofancontrol/tuxedofancontrol /usr/bin/tuxedofancontrol

systemctl enable tuxedofancontrol
systemctl start tuxedofancontrol
