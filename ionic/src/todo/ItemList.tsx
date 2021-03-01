import React, { useContext, useEffect, useRef, useState } from 'react';
import { Redirect, RouteComponentProps } from 'react-router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonLabel,
  IonHeader,
  IonIcon,
  IonList, IonLoading,
  IonPage,
  IonTitle,
  IonToolbar,
  IonListHeader,
  IonSearchbar,
  IonFooter,
  IonInfiniteScroll,
  IonPopover,
  IonInfiniteScrollContent,
  IonModal,
  createGesture,
  GestureDetail
} from '@ionic/react';
import { logOutOutline, filterOutline } from 'ionicons/icons';
import Item from './Item';
import { getLogger, useAppState, useNetwork } from '../core';
import { ItemContext } from './ItemProvider';
import { AuthContext } from '../auth/AuthProvider';
import { ItemProps } from './ItemProps';
import { forceUpdate } from 'ionicons/dist/types/stencil-public-runtime';
import { ConflictSolvingModal } from '../components/modals/ConflictSolvingModal';
import { MyGoogleMap } from '../components/MyGoogleMap';
import { MyGoogleMapPopover } from '../components/popovers/MyGoogleMapPopover';

const log = getLogger('ItemList');

//interface ItemListProps

const ItemList: React.FC<RouteComponentProps> = ({ history }) => {
  
  const [disableInfiniteScroll, setDisableInfiniteScroll] = useState(false);
  const [pos, setPos] = useState(7);
  const pageRef = useRef<HTMLElement>(null);

  const { items, offlineFetching, fetching, fetchingError, syncing, syncError } = useContext(ItemContext);
  const [showItems, setShowItems] = useState<ItemProps[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);

  const [showPopover, setShowPopover] = useState<boolean>(false);
  const [shownItem, setShownItem] = useState<ItemProps>();

  const { logout } = useContext(AuthContext);
  log('render');

  const { networkStatus } = useNetwork();

  useEffect(() => {
    log('useEffect');
    if (items) {
      //console.log(items.slice(0, 7));
      setShowItems(items.slice(0, 7));
      setDisableInfiniteScroll(false);
      setPos(7);
    }
  }, [items]);

  const handleLogout = () => {
    logout?.();
    return <Redirect to={{pathname:"/login"}} />
  };

  const handleFilter = () => {
    log('handleFilter');
    // TODO complete code here
    setShowModal(true);
  };

  const handleLongPressStart = (item: ItemProps) => {
    setShownItem(item);
    setShowPopover(true);
    log('handleLongPress');
  };

  const handleLongPressEnd = (item: ItemProps) => {
    setShowPopover(false);
    setShownItem(undefined);
  };
  
  const handleSearch = (text : string) => {
    if (!text.length && items?.length){
      setShowItems(items.slice(pos, pos + 7));
      setDisableInfiniteScroll(false);
    }
    var newItems : ItemProps[] = [];
    items?.forEach(item => {
      log('showItem ' + item);
      if (item.name.toLowerCase().startsWith(text)) {
        newItems.push(item);
      }
    });
    setShowItems(newItems);
  };

  const wait = () => {
    return new Promise(r => {
      setTimeout(()=>r(), 1000);
    });
  };

  const fetchNext = async (e: CustomEvent<void>) => {
    if (items && pos < items.length) {
      await wait();
      setShowItems([...showItems, ...items.slice(pos, 7 + pos)]);
      setPos(pos + 7);
    } else {
      setDisableInfiniteScroll(false);
    }

    await (e.target as HTMLIonInfiniteScrollElement).complete();
  };

  log('render');

  return (
    <IonPage ref={pageRef}>
        <IonHeader translucent={true}>
            {(!networkStatus || !networkStatus.connected) &&
              <IonToolbar color="danger" >
                <div style={{width: '100%', display: "flex", justifyContent: "center"}}>
                  <IonLabel >You are offline</IonLabel>
                </div>
                </IonToolbar> }

            <IonToolbar>
              <IonTitle>Item List</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={handleLogout}>
                  <IonIcon icon={logOutOutline} />
                </IonButton>
                <IonButton onClick={handleFilter}>
                  <IonIcon icon={filterOutline} />
                </IonButton>

                <IonButton onClick={() => history.push('/item')}>
                  Add
                </IonButton>
              </IonButtons>
          </IonToolbar>
        </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
              <IonTitle size="large">Item List</IonTitle>
          </IonToolbar>
          {/* <IonToolbar>
            <IonSearchbar 
             showCancelButton="focus"
             onIonChange={e => handleSearch(e.detail.value!.toLowerCase())} />
          </IonToolbar> */}
        </IonHeader>


        <IonLoading isOpen={fetching} message="Updating existing items"/>
        <IonLoading isOpen={offlineFetching} message="Fetching items..." />
        <IonLoading isOpen={syncing} message="Syncing with server..." />

        <ConflictSolvingModal
          isOpen={showModal}
          presentingElement={pageRef.current || undefined}
          onDidDismiss={() => setShowModal(false)}
          onConfirm={ () => { log('I always wanted an iPhone, so that`s why this app is looking like so.'); setShowModal(false); return Promise.resolve(); } } >

        </ConflictSolvingModal>
        
        <MyGoogleMapPopover
          isOpen={showPopover}
          onDidDismiss={() => setShowPopover(false)}
          location={shownItem?.location} />
          
        {fetchingError && (
          <div>{fetchingError.message ? `Fetch error: ${fetchingError.message}` : 'Failed to fetch items'}</div>
        )}
        {syncError && (
          <div>{syncError.message ?`Sync error: ${syncError.message}` : 'Failed to sync items'}</div>
        )}

        {showItems && (
          <IonList>
            {showItems.map(({ _id, name, provenienceCountry, amount, pricePerKg, offline, photo, location, conflict, version }) =>
              <Item 
                key={_id} _id={_id} 
                name={name} 
                amount={amount} 
                provenienceCountry={provenienceCountry} 
                pricePerKg={pricePerKg}  
                offline={offline}
                conflict={conflict}
                photo={photo}
                location={location}
                version={version}
                onLongPressStart={handleLongPressStart}
                onLongPressEnd={handleLongPressEnd}
                onEdit={id => history.push(`/item/${id}`)}
                />)}
            
              
              <IonInfiniteScroll
                threshold="100px"
                disabled={disableInfiniteScroll}
                onIonInfinite={(e: CustomEvent<void>) => fetchNext(e)}>
                  <IonInfiniteScrollContent
                    loadingText="Loading more items...">
                  </IonInfiniteScrollContent>
              </IonInfiniteScroll>
          </IonList>
        )}
        
      </IonContent>
      
    </IonPage>
  );

};

export default ItemList;


/*

&& <IonFooter>
</IonFooter>



--------------------------

<IonButtons slot="end">
              <IonButton onClick={handleLogout}>
                <IonIcon icon={logOutOutline} />
              </IonButton>
              <IonButton onClick={handleFilter}>
                <IonIcon icon={filterOutline} />
              </IonButton>

              <IonButton onClick={() => history.push('/item')}>
                Add
              </IonButton>
            </IonButtons>*/