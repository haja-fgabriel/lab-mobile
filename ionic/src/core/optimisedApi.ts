import { Storage } from '@capacitor/core';
import { getLogger } from './index';


export const getDate: () => Promise<Date> = async () => {
    const { value } = await Storage.get({key: 'date'});
    console.log(value);
    return new Date(value || 0);
}

export const storeDate = async (date: Date) => {
    await Storage.set({key: 'date', value: Date.toString()});
}