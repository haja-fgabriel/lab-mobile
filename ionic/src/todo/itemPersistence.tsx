import { Storage } from '@capacitor/core';
import { ftruncate } from 'fs';
import { updateNamedExports } from 'typescript';
import { getLogger, withLogs, generateID } from '../core';
import { IDType, ItemProps } from './ItemProps';

const log = getLogger('ItemPersistence');

export class ItemPersistence {
    static getItems : () => Promise<ItemProps[]> = async () => {
        const { value } = await Storage.get({key: "items"})
        return JSON.parse(value) || [];
    }

    static createItem : (item: ItemProps) => Promise<boolean> = async (item) => {
        let items = await ItemPersistence.getItems();
        log('createItem');
        if (items.findIndex(it => it._id === item._id) < 0) {
            if (!item._id) {
              item._id = generateID();
              item.version = 1;
            }

            items.push(item);
            log(`createItem items length ${items.length}`); 
            await Storage.set({key: "items", value: JSON.stringify(items)});
            return true;
        }
        return false;
    }

    static updateItem : (item: ItemProps) => Promise<boolean> = async (item) => {
        let items = await ItemPersistence.getItems();
        const index = items.findIndex(it => it._id === item._id);
        if (index >= 0) {
            items[index] = item;
            await Storage.set({key: "items", value: JSON.stringify(items)});
            return true;
        }
        return false;
    }

    static removeItem : (id : IDType) => Promise<boolean> = async (id) => {
        let items = await ItemPersistence.getItems();
        const index = items.findIndex(it => it._id === id);
        if (index >= 0) {
            const item = items[index];
            items.splice(index, 1);
            await Storage.set({key: "items", value: JSON.stringify(items)});
            return true;
        }
        return false;
    }

    static isPresent : (id : IDType) => Promise<boolean> = async (id) => {
        let items = await ItemPersistence.getItems();
        return items.findIndex(it => it._id === id) >= 0;
    }

    static getItem : (id : IDType) => Promise<ItemProps | undefined> = async (id) => {
        let items = await ItemPersistence.getItems();
        const index = items.findIndex(it => it._id === id);
        if (index >= 0) {
            return items[index];
        }
        return undefined;
    }

    static addAll : (items: ItemProps[]) => Promise<void> = async (items) => {
        await Storage.set({key: "items", value: JSON.stringify(items)});
    }

    static size : () => Promise<Number> = async () => {
        const { value } = await Storage.get({key: "items"});
        return JSON.parse(value).length;
    }
    
    static clear = async () => {
        // Storage.clear() clears the entire storage, that's not what we want
        await Storage.set({key: "items", value: "[]"})
    }
}