require('source-map-support').install();
require('babel-polyfill');
Promise = require('bluebird');

Promise.longStackTraces();
Promise.onPossiblyUnhandledRejection(function(error) {
    throw error;
});

require('./lib/index');
