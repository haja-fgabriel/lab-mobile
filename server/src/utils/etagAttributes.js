import { config } from 'process';

var path = require('path');
var fs = require('fs');
const configPath = './db/config.json';

export default class EtagAttributes {

    static lastModified() {
        const { lastModified } = JSON.parse(fs.readFileSync(configPath));
        return new Date(lastModified);
    }

    static setLastModified(lastModified) {
        const config = JSON.parse(fs.readFileSync(configPath));
        fs.writeFileSync(configPath, JSON.stringify({...config, lastModified}));
    }
}