let Connection = require('./Connection');

let root = {
    createConnection: (config) => {
        return new Connection(config);
    }
};

module.exports = root;
