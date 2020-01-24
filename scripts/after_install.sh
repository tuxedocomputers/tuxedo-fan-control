#!/bin/bash

rm /usr/share/applications/tuxedofancontrol.desktop

Xvfb :98 -screen 0 1x1x16 & export DISPLAY=:98 && /opt/tuxedofancontrol/tuxedofancontrol --createunitfile
ln -s /opt/tuxedofancontrol/tuxedofancontrol /usr/bin/tuxedofancontrol

systemctl enable tuxedofancontrol
systemctl restart tuxedofancontrol
