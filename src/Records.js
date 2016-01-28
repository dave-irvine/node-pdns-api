import inspector from 'schema-inspector';
import Promise from 'bluebird';

import dbg from 'debug';
let debug = dbg('pdns-api:Records');

class Records {
    constructor(connection) {
        debug(`constructor(${connection})`);

        if (!connection) {
            throw new Error('Expected Connection as constructor parameter');
        }

        this.connection = connection;
    }

    list(zone) {
        debug(`list()`);

        let connection = this.connection,
            err;

        return new Promise((resolve, reject) => {
            connection.zones.fetch(zone)
            .then((zoneRecord) => {
                let records = zoneRecord.records;

                const recordsSchema = {
                    type: 'array',
                    items: [
                        {
                            type: 'object',
                            properties: {
                                name: { type: 'string' },
                                type: { type: 'string' },
                                ttl: { type: 'number' },
                                disabled: { type: 'boolean' },
                                content: { type: 'string' }
                            }
                        }
                    ]
                };

                let result = inspector.validate(recordsSchema, records);

                if (!result.valid) {
                    err = new Error(`API returned invalid results: \n\n${result.format()}`);

                    throw err;
                }

                return resolve(records);
            })
            .catch((e) => {
                return reject(e);
            });
        });
    }
}

module.exports = Records;
