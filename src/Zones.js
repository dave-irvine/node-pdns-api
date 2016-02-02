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
            let url = `${connection.getZonesUrl().replace('{/zone}', '')}`;

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

    fetch(zone) {
        debug(`fetch(${zone})`);

        let connection = this.connection,
            err;

        return new Promise((resolve, reject) => {
            if (!zone) {
                err = new Error('zone must be supplied');
                return reject(err);
            }

            let url = `${connection.getZonesUrl().replace('{/zone}', '/' + zone)}`;

            connection.get(url)
            .then((body) => {
                let zone = body;

                const zoneSchema = {
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
                        last_check: { type: 'number' },
                        records: { type: 'array' },
                        soa_edit_api: { type: 'string', optional: true },
                        soa_edit: { type: 'string', optional: true }
                    }
                };

                let result = inspector.validate(zoneSchema, zone);

                if (!result.valid) {
                    err = new Error(`API returned invalid results: \n\n${result.format()}`);

                    throw err;
                }

                return resolve(zone);
            })
            .catch((e) => {
                return reject(e);
            })
        });
    }

    patchRRset(zone, rrset) {
        debug(`fetch(${zone})`);

        let connection = this.connection,
            err;

        if (!zone) {
            err = new Error('zone must be supplied');
            return Promise.reject(err);
        }

        if (!rrset) {
            err = new Error('rrset must be supplied');
            return Promise.reject(err);
        }

        let url = `${connection.getZonesUrl().replace('{/zone}', '/' + zone)}`;

        const rrsetSchema = {
            type: 'object',
            properties: {
                name: { type: 'string' },
                type: { type: 'string' },
                changetype: { type: 'string' },
                records: { type: 'array' }
            }
        };

        let result = inspector.validate(rrsetSchema, rrset);

        if (!result.valid) {
            err = new Error(`Specified rrset is invalid: \n\n${result.format()}`);

            return Promise.reject(err);
        }

        return connection.patch(url, rrset);
    }
}

module.exports = Zones;
