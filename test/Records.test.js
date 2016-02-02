import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';
import Promise from 'bluebird';

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('Records', () => {
    const configuration = {
        'host': 'abc',
        'port': 8080,
        'protocol': 'http',
        'key': 'abcd'
    };

    let Connection,
        Records;

    let connection,
        requestStub,
        validRecord,
        validServer,
        validZone,
        records;

    before(() => {
        Records = require('../lib/Records');

        validServer = {
            'type': 'Server',
            'id': 'localhost',
            'url': '/servers/localhost',
            'daemon_type': 'authoritative',
            'version': '3.4.7',
            'config_url': '/servers/localhost/config{/config_setting}',
            'zones_url': '/servers/localhost/zones{/zone}'
        };

        validRecord = {
            'name': 'server.test.net',
            'type': 'A',
            'ttl': 3600,
            'disabled': false,
            'content': '192.168.0.1'
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
            'records': [ validRecord ]
        };
    });

    beforeEach((done) => {
        requestStub = sinon.stub();

        Connection = proxyquire('../lib/Connection', {
            'request': requestStub
        });

        requestStub.yields(null, null, [validServer]);

        connection = new Connection(configuration);
        records = new Records(connection);

        connection.connect()
        .then(() => {
            done();
        });
    });

    describe('constructor()', () => {
        beforeEach(() => {
            Records = require('../lib/Records');
        });

        it('should throw an error if not passed a Connection object', () => {
            return expect(() => {
                return new Records();
            }).to.throw('Expected Connection');
        });

        it('should store the Connection object locally', () => {
            let expectedConnection = {
                'test': 'abcd'
            };

            let records = new Records(expectedConnection);

            return expect(records.connection).to.deep.equal(expectedConnection);
        });
    });

    describe('list()', () => {
        it('should return a Promise', () => {
            return expect(records.list()).to.be.an.instanceOf(Promise);
        });

        it('should reject if not passed a zone', () => {
            requestStub.yields(null, null, null);

            return expect(records.list()).to.eventually.be.rejectedWith('zone must be supplied');
        });

        it('should reject if the server connected to does not return an expected result', () => {
            requestStub.yields(null, null, null);

            return expect(records.list(validZone.id)).to.eventually.be.rejectedWith('API returned invalid results');
        });

        it('should resolve with a list of records', () => {
            requestStub.yields(null, null, validZone);

            return records.list(validZone.id)
            .then((recordList) => {
                return expect(recordList).to.deep.equal([validRecord]);
            });
        });
    });

    describe('add()', () => {
        it('should return a Promise', () => {
            return expect(records.add()).to.be.an.instanceOf(Promise);
        });

        it('should reject if not passed a zone', () => {
            return expect(records.add()).to.eventually.be.rejectedWith('zone must be supplied');
        });

        it('should reject if not passed a record', () => {
            return expect(records.add('abcd')).to.eventually.be.rejectedWith('record must be supplied');
        });

        it('should reject if not passed a valid record', () => {
            return expect(records.add('abcd', {})).to.eventually.be.rejectedWith('Specified record is invalid');
        });

        it('should resolve if passed a valid zone and record', () => {
            validRecord['set-ptr'] = false;

            return expect(records.add('abcd', validRecord)).to.eventually.be.fulfilled;
        });
    });
});
