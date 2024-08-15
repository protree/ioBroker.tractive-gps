import React, { useEffect, useState } from 'react';

import {
    Box, Card, CardContent,
    CardMedia, Tooltip, Typography,
} from '@mui/material';
import {
    Battery20,
    Battery30,
    Battery50,
    Battery60,
    Battery80,
    Battery90,
    BatteryCharging20,
    BatteryCharging30,
    BatteryCharging50,
    BatteryCharging60,
    BatteryCharging80,
    BatteryCharging90,
    BatteryChargingFull,
    BatteryFull,
    CheckCircle,
    Error,
    Pets,
    SatelliteAlt,
    TapAndPlay,
    Wifi,
} from '@mui/icons-material';

import type { Connection } from '@iobroker/adapter-react-v5';

import { ItemProps } from '../types';
import Maps from './Maps';

export interface PetCardProps {
    item: ItemProps;
    socket: Connection;
}

export const PetCard: React.FC<PetCardProps> = (props): React.JSX.Element => {
    const [data, setData] = useState('');

    const getImage = React.useCallback(
        async (item: ItemProps) => {
            if (item) {
                const exist = await props.socket.fileExists('tractive-gps', `${item.id}.png`);
                if (exist) {
                    console.log(`file ${item.id}.png exists`);
                    const base64 = await props.socket.readFile('tractive-gps', `${item.id}.png`, true);
                    setData(base64.file);
                } else {
                    console.error(`file ${item.id}.png does not exist`);
                }
            }
        },
        [props.socket],
    );

    useEffect(() => {
        setTimeout(() => {
            if (props.item !== undefined) {
                getImage(props.item)
                    .then(() => console.log('getImage done'))
                    .catch(err => console.error(err));
            }
        }, 200);
    }, [props.item]);

    const handleChargingState = (item: ItemProps) => {
        if (item.battery) {
            if (item.charging_state) {
                if (item.battery === 100) {
                    return <BatteryChargingFull sx={{ color: '#48ff00', paddingBottom: '5px' }} />;
                }
                if (item.battery >= 90 && item.battery < 100) {
                    return <BatteryCharging90 sx={{ color: '#40ff00', paddingBottom: '5px' }} />;
                }
                if (item.battery >= 80 && item.battery < 90) {
                    return <BatteryCharging80 sx={{ color: '#f7ff00', paddingBottom: '5px' }} />;
                }
                if (item.battery >= 60 && item.battery < 80) {
                    return <BatteryCharging60 sx={{ color: '#ffcc00', paddingBottom: '5px' }} />;
                }
                if (item.battery >= 50 && item.battery < 60) {
                    return <BatteryCharging50 sx={{ color: '#ff5900', paddingBottom: '5px' }} />;
                }
                if (item.battery >= 30 && item.battery < 50) {
                    return <BatteryCharging30 sx={{ color: '#fd4a2a', paddingBottom: '5px' }} />;
                }
                if (item.battery >= 20 && item.battery < 30) {
                    return <BatteryCharging20 sx={{ color: '#ff0000', paddingBottom: '5px' }} />;
                }
            } else {
                if (item.battery >= 20 && item.battery < 30) {
                    return <Battery20 sx={{ color: '#ff0000', paddingBottom: '5px' }} />;
                }
                if (item.battery >= 30 && item.battery < 50) {
                    return <Battery30 sx={{ color: '#fd4a2a', paddingBottom: '5px' }} />;
                }
                if (item.battery >= 50 && item.battery < 60) {
                    return <Battery50 sx={{ color: '#ff5900', paddingBottom: '5px' }} />;
                }
                if (item.battery >= 60 && item.battery < 80) {
                    return <Battery60 sx={{ color: '#ffcc00', paddingBottom: '5px' }} />;
                }
                if (item.battery >= 80 && item.battery < 90) {
                    return <Battery80 sx={{ color: '#f7ff00', paddingBottom: '5px' }} />;
                }
                if (item.battery >= 90 && item.battery < 100) {
                    return <Battery90 sx={{ color: '#40ff00', paddingBottom: '5px' }} />;
                }
                if (item.battery === 100) {
                    return <BatteryFull sx={{ color: '#48ff00', paddingBottom: '5px' }} />;
                }
            }
        }
        return null;
    };

    return <Card
        sx={{
            maxWidth: 450,
            width: '100%',
            borderRadius: '20px',
            boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.75)',
            margin: '10px',
            padding: '10px',
        }}
    >
        <CardContent
            sx={{
                margin: '5 5 0 5',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                borderRadius: '15px 15px 0px 0px',
                borderTop: '2.5px solid',
                borderRight: '2.5px solid',
                borderLeft: '2.5px solid',
                borderColor: '#000000',
                padding: '5 5 0 5',
            }}
        >
            <Pets />
            <Typography
                variant="h5"
                maxWidth="md"
                style={{ fontSize: 20 }}
            >
                {props.item.name || props.item.id}
            </Typography>
            <Pets />
        </CardContent>
        <CardMedia
            component="img"
            image={data ? `data:image/jpeg;base64,${data}` : 'images/pets.png'}
            alt="pets.png"
            sx={{
                height: '230px',
                width: '97.7%',
                paddingTop: '0px',
                paddingBottom: '0px',
                borderRight: '2.5px solid',
                borderLeft: '2.5px solid',
                margin: '0 5 0 5',
                borderColor: 'black',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                alignContent: 'flex-end',
                flexWrap: 'wrap',
                fontSize: '1rem',
                objectFit: 'contain',
            }}
        />
        <CardContent
            sx={{
                paddingTop: '10px',
                paddingBottom: '0px',
                borderRight: '2.5px solid',
                borderLeft: '2.5px solid',
                margin: '0 5 0 5',
                borderColor: 'black',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                alignContent: 'flex-end',
                flexWrap: 'wrap',
                fontSize: '1rem',
            }}
        >
            <Maps item={props.item} />
        </CardContent>
        <CardContent
            style={{
                paddingTop: 15,
                paddingBottom: 0,
                borderRight: '2.5px solid',
                borderLeft: '2.5px solid',
                borderBottom: '2.5px solid',
                margin: '0 5 5 5',
                borderColor: 'black',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                alignContent: 'flex-end',
                flexWrap: 'wrap',
                fontSize: '1rem',
                borderRadius: '0px 0px 15px 15px',
            }}
        >
            <Box
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderTop: '2.5px solid',
                    borderBottom: '2.5px solid',
                    borderRight: '2.5px solid',
                    borderLeft: '2.5px solid',
                    borderColor: 'divider',
                    borderRadius: '15px 0px 0px 15px',
                    width: '50%',
                }}
            >
                <Typography
                    gutterBottom
                    component="div"
                    style={{ marginTop: 5 }}
                >
                    Latitude:
                </Typography>
                <Typography gutterBottom color="text.secondary">
                    Longitude:
                </Typography>
                <Typography gutterBottom color="text.secondary">
                    Radius:
                </Typography>
                <Typography gutterBottom color="text.secondary">
                    Last Seen:
                </Typography>
                <Typography gutterBottom color="text.secondary">
                    Battery:
                </Typography>
                <Typography gutterBottom color="text.secondary">
                    Home:
                </Typography>
                <Typography gutterBottom color="text.secondary">
                    Status:
                </Typography>
                <Typography gutterBottom color="text.secondary">
                    Connection:
                </Typography>
            </Box>
            <Box
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderTop: '2.5px solid',
                    borderBottom: '2.5px solid',
                    borderRight: '2.5px solid',
                    borderColor: 'divider',
                    borderRadius: '0px 15px 15px 0px',
                    width: '50%',
                }}
            >
                <Typography
                    gutterBottom
                    component="div"
                    style={{ marginTop: 5 }}
                >
                    {props.item.latlong ? props.item.latlong[0] : 'loading...'}
                </Typography>
                <Typography gutterBottom color="text.secondary">
                    {props.item.latlong ? props.item.latlong[1] : 'loading...'}
                </Typography>
                <Typography gutterBottom color="text.secondary">
                    {props.item.radius ? `${props.item.radius}m` : 'loading...'}
                </Typography>
                <Typography gutterBottom color="text.secondary">
                    {props.item.lastReceived ? props.item.lastReceived : 'loading...'}
                </Typography>
                <Typography
                    gutterBottom
                    color="text.secondary"
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    {props.item.battery ? `${props.item.battery}%` : 'loading...'}
                    {' '}
                    {props.item.battery ? handleChargingState(props.item) : ''}
                </Typography>
                <Typography gutterBottom color="text.secondary">
                    {props.item.power_saving ? 'Yes' : 'No'}
                </Typography>
                <Typography gutterBottom color="text.secondary">
                    {props.item.state === 'OPERATIONAL' ? (
                        <Tooltip title={props.item.state} arrow placement="right">
                            <CheckCircle sx={{ color: 'success.main' }} />
                        </Tooltip>
                    ) : (
                        <Tooltip title={props.item.state} arrow placement="right">
                            <Error sx={{ color: 'warning.main' }} />
                        </Tooltip>
                    )}
                </Typography>
                <Typography gutterBottom color="text.secondary">
                    {props.item.connection === 'GPS' ? (
                        <SatelliteAlt />
                    ) : props.item.connection === 'KNOWN_WIFI' ? (
                        <Wifi />
                    ) : (
                        <TapAndPlay />
                    )}
                </Typography>
            </Box>
        </CardContent>
    </Card>;
};
