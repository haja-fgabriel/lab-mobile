import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonList,
  IonItem,
  IonInput,
  IonLabel,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar,
  IonDatetime,
  IonAvatar,
  IonActionSheet,
  IonIcon,
  IonImg
} from '@ionic/react';
import { getLogger, useNetwork } from '../core';
import { ItemContext } from './ItemProvider';
import { RouteComponentProps } from 'react-router';
import { ItemProps, LocationProps } from './ItemProps';
import { MapPickerModal } from '../components/modals/MapPickerModal';
import { PhotoPickerModal } from '../components/modals/PhotoPickerModal';
import { findByLabelText } from '@testing-library/react';
import { image } from 'ionicons/icons';

const log = getLogger('ItemEdit');

interface ItemEditProps extends RouteComponentProps<{
  id?: string;
}> {}

const ItemEdit: React.FC<ItemEditProps> = ({ history, match }) => {
  const { items, saving, savingError, offlineFetching, syncing, saveItem } = useContext(ItemContext);

  const pageRef = useRef<HTMLElement>(null);

  const [name, setName] = useState('');
  const [provenienceCountry, setProvenienceCountry] = useState('');
  const [amount, setAmount] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [item, setItem] = useState<ItemProps>();
  const [location, setLocation] = useState<LocationProps>();
  const [photo, setPhoto] = useState<string>();
  const [version, setVersion] = useState<number>(0);
  const [showMapModal, setShowMapModal] = useState<boolean>(false);
  const [showPhotoModal, setShowPhotoModal] = useState<boolean>(false);

  const { networkStatus } = useNetwork();
  // log(networkStatus);

  useEffect(() => {
    log('useEffect');
    const routeId = match.params.id || '';
    const item = items?.find(it => it._id === routeId);
    setItem(item);
    if (item) {
      setName(item.name);
      setProvenienceCountry(item.provenienceCountry);
      setAmount(item.amount.toString());
      setPricePerKg(item.pricePerKg.toString());
      setLocation(item?.location);
      setPhoto(item?.photo);
      setVersion(item.version);
    }
  }, [match.params.id, items]);

  const handleSave = () => {
    let editedItem = {name: name, provenienceCountry: provenienceCountry, amount:Number(amount), pricePerKg:Number(pricePerKg), location, photo, version};
    if (item) editedItem = Object.assign(editedItem, {_id: item._id});
    saveItem && saveItem(editedItem).then(() => history.goBack());
  };

  log('render');
  log(photo?.slice(0, 100));
  return (
    <IonPage ref={pageRef}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>Edit</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={()=>handleSave()}>
              Save
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <MapPickerModal
          isOpen={showMapModal}
          presentingElement={pageRef.current || undefined}
          onDidDismiss={() => setShowMapModal(false)}
          onConfirm={(location) => {setShowMapModal(false); setLocation(location);}}
          />

        <PhotoPickerModal
          isOpen={showPhotoModal}
          presentingElement={pageRef.current || undefined}
          onDidDismiss={() => setShowPhotoModal(false)}
          onConfirm={(photo) => {setShowPhotoModal(false); setPhoto(photo);}}
          />

        
        <div style={{width: '100%', display:'flex', justifyContent: 'center', paddingTop: '8px', paddingBottom: '4px'}}>
          <IonAvatar
            style={{width: '120px', height: '120px'}}
            onClick={() => setShowPhotoModal(true)}>
            {photo && <IonImg src={photo} />
              || <img src="https://i.pinimg.com/originals/3c/c0/bc/3cc0bc69ddd774caf6df81d285159ae2.jpg" />
            }
          </IonAvatar>
        </div>

        <IonList>
          <IonItem>
            <IonLabel position="fixed">Name</IonLabel>
            <IonInput value={name} onIonChange={e => setName(e.detail.value || '')}></IonInput>
          </IonItem>
          <IonItem>
            <IonLabel position="fixed">Country</IonLabel>
            <IonInput value={provenienceCountry} onIonChange={e => setProvenienceCountry(e.detail.value || '')}></IonInput>
          </IonItem>
          <IonItem>
            <IonLabel position="fixed">Amount</IonLabel>
            <IonInput value={amount} onIonChange={e => setAmount(e.detail.value || '')}></IonInput>
          </IonItem>
          <IonItem>
            <IonLabel position="fixed">Price per kg</IonLabel>
            <IonInput value={pricePerKg} onIonChange={e => setPricePerKg(e.detail.value || '')}></IonInput>
          </IonItem>
          <IonItem button onClick={() => setShowMapModal(true)} detail={true}>
            <IonLabel position="fixed">Location</IonLabel>
            {((location?.latitude && location?.longitude) && <IonLabel>{location.latitude}, {location.longitude}</IonLabel>)
              || <IonLabel color="medium">unset</IonLabel>}
          </IonItem>
          {/* <IonItem>
            <IonLabel position="fixed">Expiry date</IonLabel>
            <IonDatetime slot="end"></IonDatetime>
          </IonItem> */}
        </IonList>

        {/* <IonInput value={text} onIonChange={e => setText(e.detail.value || '')} /> */}
        <IonLoading isOpen={saving} message="Saving item..." />
        {savingError && (
          <div>{savingError.message || 'Failed to save item'}</div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ItemEdit;
