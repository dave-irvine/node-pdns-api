import dbg from 'debug';
let debug = dbg('pdns-api:Records');

class Records {
    constructor(connection) {
        debug(`constructor(${connection})`);
    }
}

module.exports = Records;
