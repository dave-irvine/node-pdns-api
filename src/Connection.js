import inspector from 'schema-inspector';
import Promise from 'bluebird';

let Records = require('./Records');
let Zones = require('./Zones');
let request = require('request');

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
                protocol: { type: 'string', pattern: /^https?$/ },
                key: { type: 'string', minLength: 1 }
            }
        };

        let result = inspector.validate(validation, config);

        if (!result.valid) {
            throw new Error(`Configuration failed validation: \n\n${result.format()}`);
        }

        this.config = config;
        this.connected = false;
        this.baseURL = `${this.config.protocol}://${this.config.host}:${this.config.port}`;
        this.zones = new Zones(this);
        this.records = new Records(this);
    }

    connect() {
        return new Promise((resolve, reject) => {
            let url = `${this.baseURL}/servers`;

            let options = {
                url,
                headers: {
                    'X-API-Key': this.config.key
                }
            };

            request(options, (error, response, body) => {
                let err = error;
                if (error) {
                    if (response && response.statusCode === 401) {
                        err = new Error('Unauthorised');
                    }

                    return reject(err);
                }

                let servers = body;

                const serversSchema = {
                    type: 'array',
                    items: [
                        {
                            type: 'object',
                            properties: {
                                type: { type: 'string' },
                                id: { type: 'string' },
                                url: { type: 'string' },
                                daemon_type: { type: 'string' },
                                version: { type: 'string' },
                                config_url: { type: 'string' },
                                zones_url: { type: 'string' }
                            }
                        }
                    ],
                    exactLength: 1
                };

                let result = inspector.validate(serversSchema, servers);

                if (!result.valid) {
                    err = new Error(`API returned invalid results: \n\n${result.format()}`);

                    return reject(err);
                }

                let server = servers[0];

                this.zones_url = server.zones_url;
                this.connected = true;
                return resolve();
            });
        });
    }
}

module.exports = Connection;
