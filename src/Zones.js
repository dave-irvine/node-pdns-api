import inspector from 'schema-inspector';
import Promise from 'bluebird';

import dbg from 'debug';
let debug = dbg('pdns-api:Zones');

class Zones {
    constructor(connection) {
        debug(`constructor(${connection})`);

        if (!connection) {
            throw new Error('Expected Connection as constructor parameter');
        }

        this.connection = connection;
    }

    list() {
        debug(`list()`);

        let connection = this.connection,
            err;

        return new Promise((resolve, reject) => {
            let url = `${connection.baseURL}${connection.zones_url.replace('{/zone}', '')}`;

            connection.get(url)
            .then((body) => {
                let zones = body;

                const zonesSchema = {
                    type: 'array',
                    items: [
                        {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                name: { type: 'string' },
                                url: { type: 'string' },
                                kind: { type: 'string' },
                                dnssec: { type: 'boolean' },
                                account: { type: 'string' },
                                masters: { type: 'array' },
                                serial: { type: 'number' },
                                notified_serial: { type: 'number' },
                                last_check: { type: 'number' }
                            }
                        }
                    ]
                };

                let result = inspector.validate(zonesSchema, zones);

                if (!result.valid) {
                    err = new Error(`API returned invalid results: \n\n${result.format()}`);

                    throw err;
                }

                return resolve(zones);
            })
            .catch((e) => {
                return reject(e);
            });
        });
    }
}

module.exports = Zones;
