import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';
import Promise from 'bluebird';

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('Zones', () => {
    const configuration = {
        'host': 'abc',
        'port': 8080,
        'protocol': 'http',
        'key': 'abcd'
    };

    let Connection,
        Zones;

    let connection,
        requestStub,
        validRRset,
        validServer,
        validZone,
        zones;

    before(() => {
        Zones = require('../lib/Zones');

        validRRset = {
            'name': 'abcd.test.net',
            'type': 'A',
            'changetype': 'REPLACE',
            'records': []
        };

        validServer = {
            'type': 'Server',
            'id': 'localhost',
            'url': '/servers/localhost',
            'daemon_type': 'authoritative',
            'version': '3.4.7',
            'config_url': '/servers/localhost/config{/config_setting}',
            'zones_url': '/servers/localhost/zones{/zone}'
        };

        validZone = {
            'id': 'test.net.',
            'url': '/servers/localhost/zones/test.net.',
            'name': 'test.net',
            'kind': 'Master',
            'dnssec': false,
            'account': '',
            'masters': [],
            'serial': 1970010101,
            'notified_serial': 0,
            'last_check': 0,
            'records': []
        };
    });

    beforeEach((done) => {
        requestStub = sinon.stub();

        Connection = proxyquire('../lib/Connection', {
            'request': requestStub
        });

        requestStub.yields(null, null, [validServer]);

        connection = new Connection(configuration);
        zones = new Zones(connection);

        connection.connect()
        .then(() => {
            done();
        });
    });

    describe('constructor()', () => {
        beforeEach(() => {
            Zones = require('../lib/Zones');
        });

        it('should throw an error if not passed a Connection object', () => {
            return expect(() => {
                return new Zones();
            }).to.throw('Expected Connection');
        });

        it('should store the Connection object locally', () => {
            let expectedConnection = {
                'test': 'abcd'
            };

            let zones = new Zones(expectedConnection);

            return expect(zones.connection).to.deep.equal(expectedConnection);
        });
    });

    describe('list()', () => {
        it('should return a Promise', () => {
            return expect(zones.list()).to.be.an.instanceOf(Promise);
        });

        it('should connect to `/zones` endpoint to fetch zone details', () => {
            requestStub.yields(null, null, [validZone]);
            let expectedURL = `${configuration.protocol}://${configuration.host}:${configuration.port}/servers/localhost/zones`;

            return zones.list()
            .then(() => {
                return expect(requestStub).to.have.been.calledWith(sinon.match({
                    url: expectedURL
                }));
            });
        });

        it('should use a GET request', () => {
            let expectedMethod = 'GET';
            requestStub.yields(null, null, [validZone]);

            return zones.list()
            .then(() => {
                return expect(requestStub).to.have.been.calledWith(sinon.match({
                    method: expectedMethod
                }));
            });
        });

        it('should reject if the server connected to does not return an expected result', () => {
            requestStub.yields(null, null, null);

            return expect(zones.list()).to.eventually.be.rejectedWith('API returned invalid results');
        });

        it('should resolve with the list of zones', () => {
            requestStub.yields(null, null, [validZone, validZone, validZone]);

            return zones.list()
            .then((zoneList) => {
                return expect(zoneList).to.deep.equal([validZone, validZone, validZone]);
            });
        });
    });

    describe('fetch()', () => {
        it('should return a Promise', () => {
            return expect(zones.fetch()).to.be.an.instanceOf(Promise);
        });

        it('should reject if not passed a zone', () => {
            return expect(zones.fetch()).to.eventually.be.rejectedWith('zone must be supplied');
        });

        it('should connect to correct zone endpoint to fetch zone records', () => {
            requestStub.yields(null, null, validZone);
            let expectedURL = `${configuration.protocol}://${configuration.host}:${configuration.port}/servers/localhost/zones/${validZone.id}`;

            return zones.fetch(validZone.id)
            .then(() => {
                return expect(requestStub).to.have.been.calledWith(sinon.match({
                    url: expectedURL
                }));
            });
        });

        it('should use a GET request', () => {
            let expectedMethod = 'GET';
            requestStub.yields(null, null, validZone);

            return zones.fetch(validZone.id)
            .then(() => {
                return expect(requestStub).to.have.been.calledWith(sinon.match({
                    method: expectedMethod
                }));
            });
        });

        it('should reject if the server connected to does not return an expected result', () => {
            requestStub.yields(null, null, null);

            return expect(zones.fetch(validZone.id)).to.eventually.be.rejectedWith('API returned invalid results');
        });

        it('should resolve with a zone', () => {
            requestStub.yields(null, null, validZone);

            return zones.fetch(validZone.id)
            .then((zoneList) => {
                return expect(zoneList).to.deep.equal(validZone);
            });
        });
    });

    describe('patchRRset()', () => {
        it('should return a Promise', () => {
            return expect(zones.patchRRset()).to.be.an.instanceOf(Promise);
        });

        it('should reject if not passed a zone', () => {
            return expect(zones.patchRRset()).to.eventually.be.rejectedWith('zone must be supplied');
        });

        it('should reject if not passed a rrset', () => {
            return expect(zones.patchRRset('abcd')).to.eventually.be.rejectedWith('rrset must be supplied');
        });

        it('should reject if not passed a valid rrset', () => {
            return expect(zones.patchRRset('abcd', {})).to.eventually.be.rejectedWith('Specified rrset is invalid');
        });

        it('should connect to correct zone endpoint to patch zone records', () => {
            requestStub.yields(null, null, validZone);
            let expectedURL = `${configuration.protocol}://${configuration.host}:${configuration.port}/servers/localhost/zones/${validZone.id}`;

            return zones.patchRRset(validZone.id, validRRset)
            .then(() => {
                return expect(requestStub).to.have.been.calledWith(sinon.match({
                    url: expectedURL
                }));
            });
        });

        it('should use a PATCH request', () => {
            let expectedMethod = 'PATCH';
            requestStub.yields(null, null, validZone);

            return zones.patchRRset(validZone.id, validRRset)
            .then(() => {
                return expect(requestStub).to.have.been.calledWith(sinon.match({
                    method: expectedMethod
                }));
            });
        });
    });
});
