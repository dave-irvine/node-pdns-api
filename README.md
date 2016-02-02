# node-pdns-api [![Build Status][Travis Image]][Travis URL] [![Supported PowerDNS][PowerDNS Image]][PowerDNS] [![Dependencies Status][DavidDM Image]][DavidDM URL]

Interact with your [PowerDNS][] 3.4.x installation via its [API][PowerDNS API] with Node.js.

## Installation

```
npm install pdns-api
```

## Usage

Require the module, create a connection and issue commands.

```
var pdns = require("pdns-api");

var connection = pdns.createConnection({
    host: 'localhost',
    port: 8081,
    protocol: 'http',
    key: 'your-api-key'
});

connection.connect().then(function () {
  //Connected!
}).catch(function (error) {
  //Error!
});
```

## API

Zones are the main API provided by PowerDNS. We also provide Records as a convenience.

All functions return a Promise unless otherwise noted.

### Zones

#### list()

Returns an Array of [zone_collection](https://doc.powerdns.com/3/httpapi/api_spec/#zone95collection).
Records are not included.

```
connection.zones.list().then(function (zoneList) {
    console.log(zoneList);
});
```

#### fetch(zoneID)

Returns an individual [zone_collection](https://doc.powerdns.com/3/httpapi/api_spec/#zone95collection).
Records are included.

Note, your zoneID must end in '.'

```
connection.zones.fetch('myzone.test.net.').then(function (zone) {
    console.log(zone);
});
```

### Records

Records have no specific entry in the PowerDNS API documentation, but their format is as follows:

```
{
    "content": <string>,
    "name": <string>, 
    "ttl": <int>,
    "type": <string>,
    "disabled": <bool>,
    "set-ptr": <bool>
}
```

#### list(zoneID)

Returns an Array for Records for a given zone.
Note, your zoneID must end in '.'

```
connection.records.fetch('myzone.test.net.').then(function (recordList) {
    console.log(recordList);
});
```

#### add(zoneID, record)

Adds a new Record to a given zone.
Returns the Zone once it has updated.

Note, your zoneID must end in '.'

```
var myRecord = {
    content: '192.168.1.1,
    name: 'myrecord',
    ttl: 3600,
    type: 'A',
    disabled: false,
    'set-ptr': false
};

connection.records.add('myzone.test.net.', myRecord).then(function (zone) {
    console.log(zone);
});
```

[PowerDNS]: https://www.powerdns.com/
[PowerDNS API]: https://doc.powerdns.com/3/httpapi/README/
[PowerDNS Image]: https://img.shields.io/badge/powerdns-3.4.x-lightgrey.svg
[Travis URL]: https://travis-ci.org/dave-irvine/node-pdns-api
[Travis Image]: https://travis-ci.org/dave-irvine/node-pdns-api.svg?branch=master
[DavidDM Image]: https://img.shields.io/david/dave-irvine/node-pdns-api.svg
[DavidDM URL]: https://david-dm.org/dave-irvine/node-pdns-api