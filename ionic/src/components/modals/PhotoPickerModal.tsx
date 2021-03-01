import { IonButton, IonButtons, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonImg, IonModal, IonPage, IonRow, IonThumbnail, IonTitle, IonToolbar } from "@ionic/react";
import { camera, cameraOutline } from "ionicons/icons";
import React from "react";
import { usePhotoGallery } from '../../core';

export interface PhotoPickerModalProps {
    isOpen: boolean;
    presentingElement?: HTMLElement | undefined;
    onDidDismiss: () => void;
    onConfirm: (photo?: string) => void;
}

export const PhotoPickerModal: React.FC<PhotoPickerModalProps> = ({isOpen, presentingElement, onDidDismiss, onConfirm}) => {
    const { takePhoto, photos, deletePhoto } = usePhotoGallery();

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
                            Pick a photo
                        </IonTitle>
                        
                        <IonButtons slot="end">
                            <IonButton onClick={async () => {await takePhoto()}}>
                                <IonIcon icon={camera}/>
                            </IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <IonContent fullscreen>
                    <IonGrid>
                        <IonRow>
                            {photos.map((photo, index) => 
                                <IonCol 
                                    size="4" 
                                    key={index}
                                    onClick={() => {onConfirm(photo.webviewPath)}}>
                                    <IonImg src={photo.webviewPath} />
                                </IonCol>
                            )}
                        </IonRow>
                    </IonGrid>
                </IonContent>
            </IonPage>
        </IonModal>
    )
}