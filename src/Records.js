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

    add(zone, record) {
        debug(`add(${zone}, ${record})`);

        let connection = this.connection,
            err;

        if (!zone) {
            err = new Error('zone must be supplied');
            return Promise.reject(err);
        }

        if (!record) {
            err = new Error('record must be supplied');
            return Promise.reject(err);
        }

        const recordSchema = {
            type: 'object',
            properties: {
                content: { type: 'string' },
                name: { type: 'string' },
                ttl: { type: 'number' },
                type: { type: 'string' },
                disabled: { type: 'boolean' },
                'set-ptr': { type: 'boolean' }
            }
        };

        let result = inspector.validate(recordSchema, record);

        if (!result.valid) {
            err = new Error(`Specified record is invalid: \n\n${result.format()}`);

            return Promise.reject(err);
        }

        let rrset = {
            name: record.name,
            type: record.type,
            changetype: 'REPLACE',
            records: [record]
        };

        return connection.zones.patchRRset(zone, rrset);
    }
}

module.exports = Records;
