import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';
import Promise from 'bluebird';

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('Zones', () => {
    let Connection,
        Zones;

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
        const configuration = {
            'host': 'abc',
            'port': 8080,
            'protocol': 'http',
            'key': 'abcd'
        };

        let connection,
            requestStub,
            validServer,
            validZone,
            zones;

        before(() => {
            requestStub = sinon.stub();

            Connection = proxyquire('../lib/Connection', {
                'request': requestStub
            });

            Zones = require('../lib/Zones');

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
                'last_check': 0
            };
        });

        beforeEach((done) => {
            requestStub.yields(null, null, [validServer]);

            connection = new Connection(configuration);
            zones = new Zones(connection);

            connection.connect()
            .then(() => {
                done();
            });
        });

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
});