import axios from 'axios';
import { authConfig, baseUrl, getLogger, optimizedAuthConfig, withLogs, storeDate } from '.';
import { ItemProps, IDType } from '../todo/ItemProps';
import { getDate } from './optimisedApi';

const itemUrl = `http://${baseUrl}/api/item`;

export const getItems: (token: string) => Promise<ItemProps[]> = async token => {
  return withLogs(axios.get(itemUrl, optimizedAuthConfig(token, await getDate())), 'getItems');
}

export const createItem: (token: string, item: ItemProps) => Promise<ItemProps[]> = (token, item) => {
  storeDate(new Date());
  return withLogs(axios.post(itemUrl, item, authConfig(token)), 'createItem');
}

export const updateItem: (token: string, item: ItemProps) => Promise<ItemProps[]> = (token, item) => {
  storeDate(new Date());
  return withLogs(axios.put(`${itemUrl}/${item._id}`, item, authConfig(token)), 'updateItem');
}

export const removeItem: (token: string, _id: IDType) => Promise<ItemProps[]> = (token, _id) => {
  storeDate(new Date());
  return withLogs(axios.delete(`${itemUrl}/${_id}`, authConfig(token)), 'deleteItem');
}

interface MessageData {
  type: string;
  payload: ItemProps;
}

const log = getLogger('ws');

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
  const ws = new WebSocket(`ws://${baseUrl}`);
  ws.onopen = () => {
    log('web socket onopen');
    ws.send(JSON.stringify({ type: 'authorization', payload: { token } }));
  };
  ws.onclose = () => {
    log('web socket onclose');
  };
  ws.onerror = error => {
    log('web socket onerror', error);
  };
  ws.onmessage = messageEvent => {
    log('web socket onmessage');
    onMessage(JSON.parse(messageEvent.data));
  };
  return () => {
    ws.close();
  }
}
