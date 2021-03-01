import React, { useContext, useEffect, useRef, useState } from 'react';
import { 
  IonItem, 
  IonItemOptions, 
  IonItemOption, 
  IonItemSliding, 
  IonLabel, 
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle, 
  IonCardSubtitle,
  IonIcon,
  IonChip,
  IonAvatar,
  IonImg,
  createGesture,
  GestureDetail} from '@ionic/react';
import { alertCircleOutline, alertCircleSharp, logoNodejs } from 'ionicons/icons';
import { ItemProps } from './ItemProps';
import { ItemContext } from './ItemProvider';
import { getLogger } from '../core';

interface ItemPropsExt extends ItemProps {
  onEdit: (_id?: string) => void;
  onLongPressStart?: (item: ItemProps) => void;
  onLongPressEnd?: (item: ItemProps) => void;
}

const log = getLogger('Item');

// TODO add photo
const Item: React.FC<ItemPropsExt> = ({ _id, name, provenienceCountry, amount, pricePerKg, offline, location, onEdit, photo, onLongPressStart, onLongPressEnd, conflict, version }) => {
  const { saveItem, deleteItem } = useContext(ItemContext);
  const [callbackTimeout, setCallbackTimeout] = useState<NodeJS.Timeout>();
  const [isCallbackCalled, setIsCallbackCalled] = useState<boolean>(false);

  const handleDelete = () => {
    log('handleDelete');
    _id && deleteItem && deleteItem(_id)
      .then(() => {})
      .catch(() => {});
  };

  const handleLongPressStart = () => {
    log('handleLongPressStart');
    setCallbackTimeout(setTimeout(() => {
      setIsCallbackCalled(true);
      onLongPressStart && onLongPressStart({_id, name, provenienceCountry, amount, pricePerKg, location, version});
    }, 500));
  };

  const handleLongPressEnd = () => {
    log('handleLongPressEnd');
    if (callbackTimeout) {
      isCallbackCalled && onLongPressEnd && onLongPressEnd({_id, name, provenienceCountry, amount, pricePerKg, location, version});
      setIsCallbackCalled(false);
      clearTimeout(callbackTimeout);
      setCallbackTimeout(undefined);
    }
    
    
  };

  log('render');

  return (
    <IonItemSliding  class="ion-no-padding" >
      <IonItem  lines="none" class="ion-no-padding" 
        onTouchStart={handleLongPressStart} 
        onMouseDown={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
        onMouseUp={handleLongPressEnd}>

        <IonCard onClick={() => onEdit(_id)}  style={{width: '100%'}}>
          <IonCardHeader>
            {photo && <IonAvatar>
              <IonImg src={photo} />
            </IonAvatar>}
            <div className="card-alert">
              {offline && 
              <div style={{display: 'inline-flex'}}> 
                <IonIcon icon={alertCircleSharp}   color="danger" /> 
                <IonLabel style={{fontSize: "13px"}}>Only offline</IonLabel> 
              </div> }
              {conflict && 
              <div style={{display: 'inline-flex'}}>
                <IonIcon icon={alertCircleSharp}   color="warning" /> 
                <IonLabel style={{fontSize: "13px"}}>Found conflict</IonLabel>
              </div>}
            </div>

            <IonCardTitle>{name}</IonCardTitle> 
            <IonCardSubtitle color="danger">{provenienceCountry}</IonCardSubtitle>
            
            <IonLabel>{pricePerKg} lei</IonLabel>

            
          </IonCardHeader>
          
          <IonCardContent>
            <IonLabel>Amount: {amount} kg</IonLabel>
          </IonCardContent>
        </IonCard>
      </IonItem>
      <IonItemOptions side="end">
        <IonItemOption  color="danger" onClick={handleDelete}>
          Delete
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  );
};

export default Item;

/*
{/*
      {/*
        
      </IonItemOptions>}
    {/*  }

*/
