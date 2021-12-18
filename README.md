# Heater control with Ewelink device and google calendar schedule

## Env variables

```
CHECK_INTERVAL_SEC=600 #Interval between each script run
GOOGLE_APPLICATION_CREDENTIALS=./google-secret.json #Path to read google service account key

EWELINK_DEVICE_ID= #Ewelink device id of device used to control heater
EWELINK_HG_CHANNEL=1 # Channel for "Hors Gel" signal. (See https://github.com/rtorrente/gcalendar_ewelink_heater_control/blob/main/fil-pilote.png)
EWELINK_OFF_CHANNEL=2 # Channel for "Off" signal.
EWELINK_EMAIL= #Email of EWelink Account (See https://ewelink-api.vercel.app/docs/quickstart)
EWELINK_PASSWORD= #Password of Ewelink Account
```
## Licence

[![GNU GPL v3.0](http://www.gnu.org/graphics/gplv3-127x51.png)](http://www.gnu.org/licenses/gpl.html)

```
gcalendar_ewelink_heater_control - Open Source Heater Control using ewelink and google calendar
Copyright (C) 2021 Romain TORRENTE

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
```
