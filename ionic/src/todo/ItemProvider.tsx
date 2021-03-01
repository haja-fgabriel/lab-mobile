import React, { useCallback, useContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger, useNetwork } from '../core';
import { ItemProps, IDType, compareItems } from './ItemProps';
import { createItem, getItems, newWebSocket, updateItem, removeItem } from '../core/itemApi';
import { AuthContext } from '../auth';
import { ItemPersistence } from './itemPersistence';
import Item from './Item';

const log = getLogger('ItemProvider');

export interface ItemConflictProps {
  offlineItem: ItemProps;
  onlineItem: ItemProps;
  resolvedItem?: ItemProps;
}

type SaveItemFn = (item: ItemProps) => Promise<any>;
type DeleteItemFn = (item: IDType) => Promise<any>;
type SolveConflictFn = (conflict: ItemConflictProps) => Promise<any>;

export interface ItemsState {
  items?: ItemProps[];
  offlineFetched: boolean;
  offlineFetching: boolean;
  offlineFetchingError?: Error | null;
  fetching: boolean;
  fetchingError?: Error | null;
  saving: boolean;
  savingError?: Error | null;
  deleting: boolean;
  deletingError?: Error | null;
  syncing: boolean;
  syncError?: Error | null;
  solvingConflict: boolean;
  saveItem?: SaveItemFn;
  deleteItem?: DeleteItemFn;
  solveConflict?: SolveConflictFn;
}

interface ActionProps {
  type: string,
  payload?: any,
}

const initialState: ItemsState = {
  offlineFetched: false,
  offlineFetching: false,
  fetching: false,
  saving: false,
  syncing: false,
  solvingConflict: false,
  deleting: false
};

const OFFLINE_FETCH_ITEMS_STARTED = 'OFFLINE_FETCH_ITEMS_STARTED';
const OFFLINE_FETCH_ITEMS_SUCCEEDED = 'OFFLINE_FETCH_ITEMS_SUCCEEDED';
const OFFLINE_FETCH_ITEMS_FAILED = 'OFFLINE_FETCH_ITEMS_FAILED';

const SYNC_ITEMS_STARTED = 'SYNC_ITEMS_STARTED';
const SYNC_ITEMS_SUCCEEDED = 'SYNC_ITEMS_SUCCEEDED';
const SYNC_ITEMS_FAILED = 'SYNC_ITEMS_FAILED';

//
// Git-like terms for synchronization actions
//
const PULL_ITEM = 'PULL_ITEM';
const PUSH_ITEM = 'PUSH_ITEM';
const PUT_CONFLICT = 'PUT_CONFLICT';

const SOLVING_CONFLICT_STARTED = 'SOLVING_CONFLICT_STARTED';
const SOLVING_CONFLICT_FINISHED = 'SOLVING_CONFLICT_FINISHED';

const FETCH_ITEMS_STARTED = 'FETCH_ITEMS_STARTED';
const FETCH_ITEMS_SUCCEEDED = 'FETCH_ITEMS_SUCCEEDED';
const FETCH_ITEMS_FAILED = 'FETCH_ITEMS_FAILED';

const SAVE_ITEM_STARTED = 'SAVE_ITEM_STARTED';
const SAVE_ITEM_SUCCEEDED = 'SAVE_ITEM_SUCCEEDED';
const SAVE_ITEM_FAILED = 'SAVE_ITEM_FAILED';

const DELETE_ITEM_STARTED      = 'DELETE_ITEM_STARTED';
const DELETE_ITEM_SUCCEEDED    = 'DELETE_ITEM_SUCCEEDED';
const DELETE_ITEM_FAILED       = 'DELETE_ITEM_FAILED';

const reducer: (state: ItemsState, action: ActionProps) => ItemsState =
  (state, { type, payload }) => {
    const items = (state.items || []);
    switch (type) {
      case OFFLINE_FETCH_ITEMS_STARTED: 
        return { ...state, offlineFetching: true, offlineFetched: false, offlineFetchingError: null };
      case OFFLINE_FETCH_ITEMS_SUCCEEDED: 
        return { ...state, offlineFetching: false, offlineFetched: true, items: payload.items };
      case OFFLINE_FETCH_ITEMS_FAILED:
        return { ...state, offlineFetching: false, offlineFetchingError: payload.error };

      case FETCH_ITEMS_STARTED:
        return { ...state, fetching: true, fetchingError: null };
      case FETCH_ITEMS_SUCCEEDED:
        return { ...state, items: payload.onlineItems, fetching: false };
      case FETCH_ITEMS_FAILED:
        return { ...state, fetchingError: payload.error, fetching: false };

      case SYNC_ITEMS_STARTED: 
        return {...state, syncing: true};
      case SYNC_ITEMS_SUCCEEDED: 
        return {...state, syncing: false};
      case SYNC_ITEMS_FAILED: 
        return {...state, syncing: false, syncError: payload.error};

      case PULL_ITEM:
        return {...state, items: [...(state.items || []), payload.item]};

      case PUSH_ITEM:
        const _items = state.items || [];
        const _index = _items.findIndex(it => it._id === payload.oldId);
        if (_index >= 0) {
          log('reducer PUSH_ITEM');
          _items.splice(_index, 1);
          return {...state, items: _items};
        } else
          return {...state};

      case PUT_CONFLICT:
        const __items = state.items || [];
        const __index = __items.findIndex(it => it._id === payload.offlineId);
        if (__index >= 0) {
          log('reducer PUT_CONFLICT');
          __items[__index].conflict = true;
          __items[__index].conflictedItem = payload.onlineItem;
          log('reducer set conflict');
          __items[__index].offline = false;
          return {...state, items: __items};
        } else
          return {...state};

        return {...state};

      case SOLVING_CONFLICT_STARTED: 
        return {...state, solvingConflict: true};
      case SOLVING_CONFLICT_FINISHED: 
        return {...state, solvingConflict: false};

      case SAVE_ITEM_STARTED:
        return { ...state, savingError: null, saving: true };
      case SAVE_ITEM_SUCCEEDED:
        const items = [...(state.items || [])];
        const item = payload.item;
        const index = items.findIndex(it => it._id === item._id);
        if (index === -1) {
          items.splice(0, 0, item);
        } else {
          items[index] = {...item };
        }
        return { ...state, items, saving: false };
      case SAVE_ITEM_FAILED:
        return { ...state, savingError: payload.error, saving: false };

      case DELETE_ITEM_STARTED:
        return { ...state, deleting: true, deletingError: null};
      case DELETE_ITEM_SUCCEEDED:
        const delItems = [...(state.items || [])];
        const delIndex = delItems.findIndex(it => it._id === payload._id);
        if (delIndex !== -1) {
          // delItems.unshift(item);
          delItems.splice(delIndex, 1);
        }
        return { ...state, items: delItems, deleting: false }
      case DELETE_ITEM_FAILED:
        return { ...state, deleting: false, deletingError: payload.error}
      default:
        return state;
    }
  };

export const ItemContext = React.createContext<ItemsState>(initialState);

interface ItemProviderProps {
  children: PropTypes.ReactNodeLike,
}

export const ItemProvider: React.FC<ItemProviderProps> = ({ children }) => {
  const { networkStatus } = useNetwork();
  const { token } = useContext(AuthContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { items, offlineFetching, offlineFetched, offlineFetchingError, fetching, fetchingError, saving, savingError, syncing, syncError, solvingConflict, deleting, deletingError } = state;
  
  useEffect(getItemsEffect, [token]);
  useEffect(syncItemsEffect, [token, offlineFetched, networkStatus]);
  useEffect(wsEffect, [token, networkStatus]);

  const saveItem = useCallback<SaveItemFn>(saveItemCallback, [token, networkStatus]);
  const deleteItem = useCallback<DeleteItemFn>(deleteItemCallback, [token, networkStatus]);
  const solveConflict = useCallback<SolveConflictFn>(solveConflictCallback, [token, networkStatus]);
  const value = { items, offlineFetching, offlineFetched, offlineFetchingError, fetching, fetchingError, saving, savingError, syncing, syncError, solvingConflict, deleting, deletingError, saveItem, deleteItem };
  
  log('render');

  return (
    <ItemContext.Provider value={value}>
      {children}
    </ItemContext.Provider>
  );

  function getItemsEffect() {
    let canceled = false;
    offlineFetchItems();
    return () => {
      canceled = true;
    }

    async function offlineFetchItems() {
      try{
        log('offlineFetchItems started');
        if (!canceled) {
          dispatch({type: OFFLINE_FETCH_ITEMS_STARTED});
          const items = await ItemPersistence.getItems();
          log('offlineFetchItems succeeded');
          dispatch({type: OFFLINE_FETCH_ITEMS_SUCCEEDED, payload: { items }});
        }
      } catch(error) {
        log('offlineFetchItems failed');
        dispatch({type: OFFLINE_FETCH_ITEMS_FAILED, payload: {error}});
      }
    }
  }


  function syncItemsEffect() {
    let canceled = false;
    syncItems();
    return () => {
      canceled = true;
    }

    async function syncItems() {
      if (!token?.trim())            return;
      if (!networkStatus?.connected) return;
      if (!offlineFetched || !items) return;

      try {
        log('syncItems started');
        dispatch({type: SYNC_ITEMS_STARTED});
        let onlineItems;
        try {
           onlineItems = await getItems(token);
        } catch(error) {
          if (error.response.status === 304) {
            dispatch({type: SYNC_ITEMS_SUCCEEDED});
          } else {  
            dispatch({type: SYNC_ITEMS_FAILED, payload: {error}})
          }
          
          return;
        }
        const offlineItems = [...items];

        if (canceled) return;
              
        for (let i = 0; i < onlineItems.length; i++) {
          const item = {...onlineItems[i]};
          const offlineItemIndex = offlineItems.findIndex(i => i._id && i._id === item._id);
          
          // abnormal behavior on the server, it should have an ID
          if (!item._id) {
            dispatch({type: SYNC_ITEMS_FAILED, payload: {error: 'Fetched item without ID from server'}});
            return;
          }

          if (offlineItemIndex < 0) {
            await ItemPersistence.createItem(item);
            log('syncItems found new item online');
            dispatch({type: PULL_ITEM, payload: {item}});
            
          } else {
            const offlineItem = {...offlineItems[offlineItemIndex]};
            delete offlineItem.offline;

            if (offlineItem.version > item.version) {
              log('syncItems offline item with newer version');
              await updateItem(token, offlineItem);
            } else if (offlineItem.version < item.version) {
              log('syncItems online item with newer version');
              ItemPersistence.updateItem(item);
              dispatch({type: SAVE_ITEM_SUCCEEDED, payload: {item}});
            } else if (!compareItems(item, offlineItem)) {
              log('syncItems conflict');
              // conflict has to be manually solved by the end user
              ItemPersistence.updateItem({...offlineItem, conflict: true, conflictedItem: item});
              dispatch({type: PUT_CONFLICT, payload: {offlineId: item._id, onlineItem: item}});
            }
          }
        }

        for (let i = 0; i < offlineItems.length; i++) {
          const item = {...offlineItems[i]};
          if (item._id && onlineItems.findIndex(i => i._id && i._id === item._id) < 0) {
            log('syncItems - we have offline items');
            try {
              const oldId = item._id;
              const itemWithoutId = {...item};
              delete itemWithoutId._id;
              delete itemWithoutId.offline;
              await ItemPersistence.removeItem(oldId);
              dispatch({type: PUSH_ITEM, payload: {oldId}});
              console.log(itemWithoutId);
              await createItem(token, itemWithoutId);
            } catch(e) {}
          }
        }

        log('syncItems succeeded');
        dispatch({type: SYNC_ITEMS_SUCCEEDED});
        
      } catch(error) {

        log('syncItems failed');
        dispatch({type: SYNC_ITEMS_FAILED, payload: {error}});
      }
    }
  }

  //
  // Callbacks for online saving
  //
  async function saveItemCallback(oldItem: ItemProps): Promise<any> {
    dispatch({ type: SAVE_ITEM_STARTED });

    const item = {...oldItem, version: oldItem.version + 1 };
    console.log(item);
    
    const saveOffline = async (item: ItemProps) => {
      item = {...item, offline: true};
      try {
        log('saveItem offline started');
        await (item._id ? ItemPersistence.updateItem(item) : ItemPersistence.createItem(item));
        log('saveItem offline succeeded');
        
        dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { item } });
        return Promise.resolve();
      } catch (error) {
        log('saveItem offline failed');
        return Promise.reject(error);
      }
    }

    if (networkStatus?.connected) {
      try {
        log('saveItem online started');
        console.log(item);
        await (item._id ? updateItem(token, item) : createItem(token, item));
        log('saveItem online succeeded');
      } catch (error) {
        log('saveItem online failed');
        saveOffline(item);
        log(error);
      }
    } else {
      saveOffline(item);
    }
  }

  async function solveConflictCallback(conflict: ItemConflictProps): Promise<any> {
    if (!networkStatus?.connected) {
      return Promise.reject();
    }

    return Promise.resolve();
  }

  async function deleteItemCallback(_id: IDType) {
    let savedOnline = true;
    try {
      log('deleteItem started');
      dispatch({ type: DELETE_ITEM_STARTED });
      if (networkStatus && networkStatus.connected) {
        // TODO do actual update
        await removeItem(token, _id);
        dispatch({ type: DELETE_ITEM_SUCCEEDED, payload: {_id} });
      }
      log('deleteItem succeeded');
    } catch (error) {
      dispatch({ type: DELETE_ITEM_FAILED, payload: {error} });
      log('deleteItem failed');
    }
  }



  function wsEffect() {
    let canceled = false;
    log('wsEffect - connecting');
    const closeWebSocket = newWebSocket(token, async message => {
      if (canceled) {
        return;
      }
      const { type, payload: item } = message;
      log(`ws message, item ${type}`);
      if (type === 'created' || type === 'updated') {
        // TODO solve conflict
        console.log(item);
        if (item._id) {
          const offlineItem = await ItemPersistence.getItem(item._id);
          if (offlineItem) {
            delete offlineItem.offline;
            if (item.version > offlineItem.version || item.version === offlineItem.version && compareItems(item, offlineItem)) {
              log('wsEffect updated item like normal people');
              ItemPersistence.updateItem(item);
              dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { item: {...item, offline: false} } });
            } else if (!compareItems(item, offlineItem)) {
              log('wsEffect conflicting items');
              ItemPersistence.updateItem({...offlineItem, offline: false, conflict: true, conflictedItem: item})
              dispatch({type: PUT_CONFLICT, payload: {offlineId: item._id, onlineItem: item}});
            } 
          } else {
            log('wsEffect new item');
            ItemPersistence.createItem(item);
            dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { item: {...item, offline: false} } });
          }
        }
      } 
    });

    if (!networkStatus?.connected) {
      log('wsEffect - disconnecting XXX');
      closeWebSocket();
    }

    return () => {
      log('wsEffect - disconnecting');
      canceled = true;
      closeWebSocket();
    }
  }
};
