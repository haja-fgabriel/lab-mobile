import React from "react";
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import { RouteComponentProps } from "react-router";
import { settingsSharp } from "ionicons/icons";

const Settings : React.FC<RouteComponentProps> = ({history}) => {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>
              Settings
            </IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
        </IonContent>
      </IonPage>
    )
}

export default Settings;