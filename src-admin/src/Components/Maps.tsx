import React, { useMemo } from 'react';
import { Box } from '@mui/material';

import { ItemProps } from '../types';

interface MapsProps {
    item: ItemProps;
    // props
}

const Maps: React.FC<MapsProps> = ({ item }): React.JSX.Element | null => {
    const [LeafletComponents, setLeafletComponents] = React.useState<{
        Circle: any;
        MapContainer: any;
        Marker: any;
        TileLayer: any;
    } | null>(null);

    React.useEffect(() => {
        import('react-leaflet')
            .then((module: any) => {
                setLeafletComponents({
                    Circle: module.Circle,
                    MapContainer: module.MapContainer,
                    Marker: module.Marker,
                    TileLayer: module.TileLayer,
                });
            });
    }, []);

    if (item.latlong === undefined) {
        item.latlong = [0, 0];
    }
    if (item.radius === undefined) {
        item.radius = 0;
    }
    // const [map, setMap] = React.useState<[number, number]>([item.latlong[0], item.latlong[1]]);

    const map = useMemo((): [number, number] => {
        if (item.latlong) {
            return [item.latlong[0], item.latlong[1]];
        }
        return [0, 0];
    }, [item.latlong]);

    if (!LeafletComponents) {
        return null; // or a loading spinner
    }

    return (
        <Box
            sx={{
                width: '100%',
                height: 200,
                borderRadius: '10px',
                overflow: 'hidden',
                '.leaflet-control': { display: 'none' },
            }}
        >
            <LeafletComponents.MapContainer
                center={map}
                zoomControl={false}
                doubleClickZoom={false}
                touchZoom={false}
                zoom={18}
                scrollWheelZoom
                style={{ height: '100%', width: '100%', borderRadius: '10px' }}
                dragging
            >
                <LeafletComponents.TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LeafletComponents.Marker position={map} />
                <LeafletComponents.Circle center={map} radius={item.radius} />
            </LeafletComponents.MapContainer>
        </Box>
    );
};

export default Maps;
