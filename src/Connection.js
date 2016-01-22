import dbg from 'debug';
let debug = dbg('pdns-api:Connection');

export default class Connection {
    constructor(config) {
        debug(`constructor(${config})`);
    }
}
