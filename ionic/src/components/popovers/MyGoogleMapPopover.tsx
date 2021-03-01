import { IonItem, IonLabel, IonList, IonModal, IonPopover } from "@ionic/react";
import React from "react";
import { getLogger } from "../../core";
import { LocationProps } from "../../todo/ItemProps";
import { MyGoogleMap } from "../MyGoogleMap";

const log = getLogger('MyGoogleMapPopover');

const style = {
    marginLeft  : "12px",
    marginRight : "12px",
    marginTop   : "12px"
};

export interface MyGoogleMapPopoverProps {
    isOpen: boolean;
    location?: LocationProps;
    onDidDismiss: () => void;
}

export const MyGoogleMapPopover: React.FC<MyGoogleMapPopoverProps> = ({isOpen, location, onDidDismiss}) => {
    log('render');
    console.log(location);
    return (
        <IonPopover 
          id="google-maps"
          animated={true}
          isOpen={isOpen}
          onDidDismiss={onDidDismiss}>
            {location?.latitude && location?.longitude && 
            <MyGoogleMap 
                options={{mapTypeControl: false, scaleControl: false, streetViewControl: false, zoomControl: false, fullscreenControl: false}}
                location={location} 
                style={{height: '360px'}} 
                />
            || <p style={style}>No proper location for this item</p>}
        </IonPopover>
    );
}