import dotenv from 'dotenv';
import { google } from 'googleapis';
import Ewelink from 'ewelink-api';

dotenv.config();

const CHECK_INTERVAL_SEC = Number(process.env.CHECK_INTERVAL_SEC) || 60 * 60; // check every hour by default
const EWELINK_DEVICE_ID = process.env.EWELINK_DEVICE_ID;
const EWELINK_HG_CHANNEL = Number(process.env.EWELINK_HG_CHANNEL);
const EWELINK_OFF_CHANNEL = Number(process.env.EWELINK_OFF_CHANNEL);
const EWELINK_EMAIL = process.env.EWELINK_EMAIL;
const EWELINK_PASSWORD = process.env.EWELINK_PASSWORD;

console.log('Script will be run every ', CHECK_INTERVAL_SEC, ' seconds');

if (!EWELINK_DEVICE_ID || !EWELINK_HG_CHANNEL || !EWELINK_OFF_CHANNEL || !EWELINK_EMAIL || !EWELINK_PASSWORD) {
    throw new Error("App can't start without requireds environnement variables");
}

enum MODE_TYPE {
    HG = 'HG',
    OFF = 'OFF',
    CONFORT = 'CONFORT',
    ECO = 'ECO',
}

const STATES_CONFIG = {
    [MODE_TYPE.CONFORT]: {
        HG_STATE: 'off',
        OFF_STATE: 'off',
    },
    [MODE_TYPE.ECO]: {
        HG_STATE: 'on',
        OFF_STATE: 'on',
    },
    [MODE_TYPE.HG]: {
        HG_STATE: 'on',
        OFF_STATE: 'off',
    },
    [MODE_TYPE.OFF]: {
        HG_STATE: 'off',
        OFF_STATE: 'on',
    },
};

const getCurrentCalendarHeatMode = async () => {
    // API Connexion
    const auth = new google.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });

    const calendar = google.calendar({
        version: 'v3',
        auth,
    });

    const timeStampNow = new Date().getTime();

    const eventsLists = await calendar.events.list({
        calendarId: '9bjkhdsdfer3pc85sivt1k3g5g@group.calendar.google.com',
        timeMin: new Date(timeStampNow).toISOString(),
        // We add 1.2 sec to be sure it's more than 1 sec later than timeMin
        timeMax: new Date(timeStampNow + 1200).toISOString(),
        maxResults: 1,
        singleEvents: true,
        orderBy: 'startTime',
        showDeleted: false,
        showHiddenInvitations: false,
    });

    if (eventsLists.data.items && eventsLists.data.items.length > 0) {
        const currentEvent = eventsLists.data.items[0].summary && eventsLists.data.items[0].summary.toUpperCase();
        return Object.values(MODE_TYPE).find((type) => type.toUpperCase() === currentEvent);
    }

    return undefined;
};

const setHeatModeToEwelinkDevice = async (mode: MODE_TYPE) => {
    const connection = new Ewelink({
        email: EWELINK_EMAIL,
        password: EWELINK_PASSWORD,
    });

    const HG_STATE = await connection.getDevicePowerState(EWELINK_DEVICE_ID, EWELINK_HG_CHANNEL);
    const OFF_STATE = await connection.getDevicePowerState(EWELINK_DEVICE_ID, EWELINK_OFF_CHANNEL);

    const neededConfig = STATES_CONFIG[mode];

    // .state is undefined when device is offline
    if (HG_STATE.state && OFF_STATE.state) {
        if (HG_STATE.state !== neededConfig.HG_STATE) {
            console.log('We toogle HG_STATE');
            await connection.setDevicePowerState(EWELINK_DEVICE_ID, neededConfig.HG_STATE, EWELINK_HG_CHANNEL);
            // Hack to handle ewelink bug when two channel are toggled simultaneously
            await new Promise((resolve) => setTimeout(resolve, 10000));
        }

        // .state is undefined when device is offline
        if (OFF_STATE.state !== neededConfig.OFF_STATE) {
            console.log('We toogle OFF_STATE');
            await connection.setDevicePowerState(EWELINK_DEVICE_ID, neededConfig.OFF_STATE, EWELINK_OFF_CHANNEL);
        }
    } else {
        console.log('Ewelink device seems down');
    }
};

const main = async () => {
    try {
        console.log('Start synchronisation script at ', new Date().toISOString());
        const currentMode = (await getCurrentCalendarHeatMode()) ?? MODE_TYPE.HG;
        console.log('We got ', currentMode, ' from google');
        await setHeatModeToEwelinkDevice(currentMode);
        console.log('End of synchronisation script at ', new Date().toISOString());
    } catch (e) {
        console.error(e);
    }
};

main();
setInterval(() => main(), CHECK_INTERVAL_SEC * 1000);
