import { IonButton, IonButtons, IonContent, IonHeader, IonModal, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { LocationProps } from '../../todo/ItemProps';
import { ItemConflictProps } from '../../todo/ItemProvider';
import { MyGoogleMap } from '../MyGoogleMap';

export interface MapPickerModalProps {
    location?: LocationProps;
    isOpen: boolean;
    presentingElement?: HTMLElement | undefined;
    onDidDismiss: () => void;
    onConfirm: (location: LocationProps) => void;
}

export const MapPickerModal : React.FC<MapPickerModalProps> = ({isOpen, presentingElement, location, onDidDismiss, onConfirm}) => {
    const [newLocation, setNewLocation] = useState<LocationProps>(location || {latitude: 46.7533824, longitude: 23.5929599999999});

    return (
        <IonModal
          isOpen={isOpen}
          swipeToClose={true}
          presentingElement={presentingElement}
          onDidDismiss={onDidDismiss}>
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                        <IonButton onClick={onDidDismiss}>Cancel</IonButton>
                        </IonButtons>
                        <IonTitle>
                            Choose location
                        </IonTitle>
                        
                        <IonButtons slot="end">
                        <IonButton onClick={async () => {await onConfirm(newLocation)}}>Done</IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <MyGoogleMap
                        options={{streetViewControl: false, fullscreenControl: false}}
                        location={newLocation}
                        onMapClick={(location: LocationProps) => setNewLocation(location)}
                        />
                </IonContent>
            </IonPage>
        </IonModal>
    );
}