import { Storage } from '@capacitor/core';
import { getLogger } from '../core';

const log = getLogger('AuthPersistence');

export class AuthPersistence {

    static loginWithToken : () => Promise<string> = async () => {
        // TODO validate token
        const { value } = await Storage.get({key: "authToken"});
        log('value: ' + value);
        if (value) {
            return Promise.resolve(value);
        } else 
            return Promise.reject("Missing authentication token");
    }

    static storeToken : (token: string) => Promise<void> = async (token) => {
        return Storage.set({key: "authToken", value: token});
    }

    static clearToken : () => Promise<void> = async () => {
        return Storage.set({key: "authToken", value: ""});
    }
}