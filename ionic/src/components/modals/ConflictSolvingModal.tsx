import { IonButton, IonButtons, IonContent, IonHeader, IonModal, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import PropTypes from 'prop-types';
import React from 'react';
import { ItemConflictProps } from '../../todo/ItemProvider';

export interface ConflictSolvingModalProps {
    isOpen: boolean;
    presentingElement?: HTMLElement | undefined;
    onDidDismiss: () => void;
    onConfirm: (conflict?: ItemConflictProps) => Promise<any>;
}

export const ConflictSolvingModal : React.FC<ConflictSolvingModalProps> = ({isOpen, presentingElement, onDidDismiss, onConfirm}) => {
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
                            Choose a location
                        </IonTitle>
                        
                        <IonButtons slot="end">
                        <IonButton onClick={async () => {await onConfirm()}}>Done</IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <IonContent>

                </IonContent>
            </IonPage>
        </IonModal>
    );
}