import React from 'react';
import { ThemeProvider, StyledEngineProvider, Theme } from '@mui/material/styles';

import {
    AppBar, Box,
    Grid, Toolbar,
} from '@mui/material';

import {
    Loader, withWidth,
    GenericApp,
    type GenericAppSettings,
    type GenericAppProps,
    type GenericAppState, Icon,
} from '@iobroker/adapter-react-v5';
import '@iobroker/adapter-react-v5/index.css';
import { PetCard } from './Components/PetCard';
import type { ItemProps, TractiveDevice } from './types';

import en from './i18n/en.json';
import de from './i18n/de.json';
import ru from './i18n/ru.json';
import es from './i18n/es.json';
import fr from './i18n/fr.json';
import it from './i18n/it.json';
import nl from './i18n/nl.json';
import pl from './i18n/pl.json';
import pt from './i18n/pt.json';
import uk from './i18n/uk.json';
import zhCN from './i18n/zh-cn.json';

declare global {
    interface Window {
        sentryDSN: string | undefined;
    }
}

const styles = {
    root: (theme: Theme) => ({
        flexGrow: 1,
        display: 'flex',
        width: '100%',
        height: '100%',
        background: theme.palette.background.default,
        color: theme.palette.text.primary,
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    }),

    content: (theme: Theme) => ({
        width: '100%',
        height: '100%',
        backgroundColor: theme.palette.background.default,
        position: 'relative',
    }),
    buttonsContainer: {
        '& button': {
            whiteSpace: 'nowrap',
        },
    },
};

interface AppState extends GenericAppState {
    ready: boolean;
    itemArray: ItemProps[];
    json: string;
    nameArray: { id: string; name: string }[];
}

class App extends GenericApp<GenericAppProps, AppState> {
    constructor(props: GenericAppProps) {
        const settings: GenericAppSettings = {};

        settings.translations = {
            en,
            de,
            es,
            fr,
            it,
            nl,
            pl,
            pt,
            ru,
            uk,
            'zh-cn': zhCN,
        };

        settings.sentryDSN = window.sentryDSN;

        if (window.location.port === '3000') {
            settings.socket = { port: '8081' };
        }
        if (window.socketUrl?.startsWith(':')) {
            window.socketUrl = `${window.location.protocol}//${window.location.hostname}${window.socketUrl}`;
        }

        super(props, settings);
    }

    static processState(
        state: Partial<ioBroker.State> | null | undefined,
        nameArray: { id: string; name: string }[],
    ): ItemProps[] {
        const itemArray: ItemProps[] = [];
        if (state?.val && typeof state.val === 'string') {
            try {
                const json: TractiveDevice = JSON.parse(state.val) as TractiveDevice;
                for (const tracker of json.device_pos_report) {
                    const device: ItemProps = {
                        id: tracker._id,
                        latlong: tracker.latlong,
                        lastReceived: new Date(tracker.time_rcvd * 1000).toLocaleString(),
                        radius: tracker.pos_uncertainty,
                        connection: tracker.sensor_used,
                    };
                    if (nameArray && nameArray[tracker._id]) {
                        device.name = nameArray[tracker._id];
                    }

                    itemArray.push(device);
                }
                for (const tracker of json.device_hw_report) {
                    const device = {
                        id: tracker._id,
                        battery: tracker.battery_level,
                    };
                    const index = itemArray.findIndex(item => item.id === device.id);
                    if (index !== -1) {
                        itemArray[index].battery = device.battery;
                    }
                }
                for (const tracker of json.tracker) {
                    const device = {
                        id: tracker._id,
                        power_saving: tracker.state_reason === 'POWER_SAVING',
                        state: tracker.state,
                        charging_state: tracker.charging_state === 'CHARGING',
                    };
                    const index = itemArray.findIndex(item => item.id === device.id);
                    if (index !== -1) {
                        itemArray[index].power_saving = device.power_saving;
                        itemArray[index].state = device.state;
                        itemArray[index].charging_state = device.charging_state;
                    }
                }
            } catch {
                console.error(`Cannot parse JSON: ${state.val}`);
            }
        }
        return itemArray;
    }

    async onConnectionReady() {
        // read first `${namespace}.json` to get the list of devices
        const state = await this.socket.getState(`traction-gps.${this.instance}.json`);
        const config = await this.socket.getObject(`system.adapter.traction-gps.${this.instance}`);
        const itemArray = App.processState(state, config?.native?.nameArray);
        this.setState({
            itemArray,
            ready: true,
            nameArray: config?.native?.nameArray || [],
            json: (state?.val || '').toString(),
        });
        await this.socket.subscribeState(`traction-gps.${this.instance}.json`, this.onJsonChange);
        await this.socket.subscribeObject(`system.adapter.traction-gps.${this.instance}`, this.onConfigChange);
    }

    onConfigChange = (id: string, obj: ioBroker.Object | null | undefined) => {
        if (obj?.native?.nameArray) {
            const itemArray = App.processState({ val: this.state.json }, obj.native.nameArray);
            if (JSON.stringify(itemArray) !== JSON.stringify(this.state.itemArray)) {
                this.setState({ itemArray, nameArray: obj.native.nameArray || [] });
            } else {
                this.setState({ nameArray: obj.native.nameArray });
            }
        }
    };

    onJsonChange = (id: string, state: ioBroker.State | null | undefined) => {
        const itemArray = App.processState(state, this.state.nameArray);
        if (JSON.stringify(itemArray) !== JSON.stringify(this.state.itemArray)) {
            this.setState({ itemArray, json: (state?.val || '').toString() });
        }
    };

    render() {
        if (!this.state.ready) {
            return <StyledEngineProvider injectFirst>
                <ThemeProvider theme={this.state.theme}>
                    <Loader themeType={this.state.themeType} />
                </ThemeProvider>
            </StyledEngineProvider>;
        }

        return <StyledEngineProvider injectFirst>
            <ThemeProvider theme={this.state.theme}>
                <Box
                    component="div"
                    sx={styles.root}
                    key="divSide"
                >
                    <AppBar>
                        <Toolbar variant="dense">
                            <Icon src="./tractive-logo.svg" alt="logo" style={{ height: 32, marginRight: 16 }} />
                        </Toolbar>
                    </AppBar>
                    <Grid container>
                        {this.state.itemArray?.map(items =>
                            <PetCard
                                key={items.id}
                                item={items}
                                socket={this.socket}
                            />)}
                    </Grid>
                </Box>
                {this.renderError()}
                {this.renderToast()}
            </ThemeProvider>
        </StyledEngineProvider>;
    }
}

export default withWidth()(App);
