import inspector from 'schema-inspector';
let Records = require('./Records');
let Zones = require('./Zones');

import dbg from 'debug';
let debug = dbg('pdns-api:Connection');

class Connection {
    constructor(config) {
        debug(`constructor(${config})`);

        const validation = {
            type: 'object',
            properties: {
                host: { type: 'string', minLength: 3 },
                port: { type: 'number', minLength: 1 },
                protocol: { type: 'string', pattern: /^https?$/ }
            }
        };

        let result = inspector.validate(validation, config);

        if (!result.valid) {
            throw new Error(`Configuration failed validation: \n\n${result.format()}`);
        }

        this.connected = false;
        this.zones = new Zones(this);
        this.records = new Records(this);
    }
}

module.exports = Connection;
