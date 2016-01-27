import dbg from 'debug';
let debug = dbg('pdns-api:Zones');

class Zones {
    constructor(connection) {
        debug(`constructor(${connection})`);
    }
}

module.exports = Zones;
