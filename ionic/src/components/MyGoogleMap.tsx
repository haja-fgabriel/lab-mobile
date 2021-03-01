import { options } from 'ionicons/icons';
import React, { CSSProperties, useEffect } from 'react';
import { GoogleMap, Marker, withGoogleMap, withScriptjs } from 'react-google-maps';
import { ComponentEnhancer, compose, withProps } from 'recompose';
import { getLogger } from '../core';
import { LocationProps } from "../todo/ItemProps";
import { googleMapsApiKey } from '../utils';

const log = getLogger('MyGoogleMap');

export interface MyGoogleMapProps {
    location: LocationProps;
    style?: CSSProperties;
    options?: any;
    onMapClick?: (l: LocationProps) => void;
}

const ComposeGoogleMap = compose<MyGoogleMapProps, any> (
    withProps({
        googleMapURL: `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&v=3.exp&libraries=geometry,drawing,places`,
        loadingElement: <div style={{ height: `100%` }} />,
        containerElement: <div style={{ height: `100%`}} />,
        mapElement: <div style={{ height: `100%` }} />
    }),
    withScriptjs,
    withGoogleMap
)(props => {
    log('render');
    return (
        <GoogleMap
            defaultZoom={8}
            options={props.options}
            defaultCenter={ { lat: props.location.latitude, lng: props.location.longitude }}
            onClick={(e) => props.onMapClick && props.onMapClick({
                latitude: e.latLng.lat(),
                longitude: e.latLng.lng()
            })}>
            <Marker position={{ lat: props.location.latitude, lng: props.location.longitude }} />
        </GoogleMap> 
    );
});

export const MyGoogleMap: React.FC<MyGoogleMapProps> = (props) => {
    return (
        <div style={props.style || {height: '100%'}}>
            <ComposeGoogleMap {...props} />
        </div>
    )
}