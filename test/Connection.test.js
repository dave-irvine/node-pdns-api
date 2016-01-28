import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';
import Promise from 'bluebird';

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('Connection', () => {
    let Connection;

    describe('constructor()', () => {
        beforeEach(() => {
            Connection = require('../lib/Connection');
        });

        it('should throw an error if not passed a configuration object', () => {
            return expect(() => {
                return new Connection();
            }).to.throw('Configuration failed validation: ');
        });

        it('should throw an error if the configuration object fails validation', () => {
            return expect(() => {
                return new Connection({});
            }).to.throw('Configuration failed validation: ');
        });

        describe('configuration validator', () => {
            it('should throw an error if `host` property is missing', () => {
                let configuration = {
                    'port': 8080,
                    'protocol': 'http'
                };

                return expect(() => {
                    return new Connection(configuration);
                }).to.throw('Property @.host: is missing and not optional');
            });

            it('should throw an error if `host` property is less than 3 characters', () => {
                let configuration = {
                    'host': 'a',
                    'port': 8080,
                    'protocol': 'http'
                };

                return expect(() => {
                    return new Connection(configuration);
                }).to.throw('Property @.host: must be longer than 3 elements');
            });

            it('should throw an error if `port` property is missing', () => {
                let configuration = {
                    'host': 'abc',
                    'protocol': 'http'
                };

                return expect(() => {
                    return new Connection(configuration);
                }).to.throw('Property @.port: is missing and not optional');
            });

            it('should throw an error if `port` property is not a Number', () => {
                let configuration = {
                    'host': 'abc',
                    'port': 'abc',
                    'protocol': 'http'
                };

                return expect(() => {
                    return new Connection(configuration);
                }).to.throw('Property @.port: must be number');
            });

            it('should throw an error if `protocol` property is missing', () => {
                let configuration = {
                    'host': 'abc',
                    'port': 8080
                };

                return expect(() => {
                    return new Connection(configuration);
                }).to.throw('Property @.protocol: is missing and not optional');
            });

            it('should throw an error if `protocol` property is neither `http` nor `https`', () => {
                let configuration = {
                    'host': 'abc',
                    'port': 8080,
                    'protocol': 'abc'
                };

                return expect(() => {
                    return new Connection(configuration);
                }).to.throw('Property @.protocol: must match [/^https?$/]');
            });

            it('should throw an error if `key` property is missing', () => {
                let configuration = {
                    'host': 'abc',
                    'port': 8080,
                    'protocol': 'http'
                };

                return expect(() => {
                    return new Connection(configuration);
                }).to.throw('Property @.key: is missing and not optional');
            });
        });

        it('should return a Connection instance if the configuration object passes validation', () => {
            let connection = new Connection({
                'host': 'abc',
                'port': 8080,
                'protocol': 'http',
                'key': 'abc'
            });

            return expect(connection).to.be.an.instanceOf(Connection);
        });

        it('should pass a reference to itself to the Records constructor', () => {
            let connectionConstructor = sinon.stub();
            Connection = proxyquire('../lib/Connection', {
                './Records': connectionConstructor
            });

            let connection = new Connection({
                'host': 'abc',
                'port': 8080,
                'protocol': 'http',
                'key': 'abc'
            });

            return expect(connectionConstructor).to.have.been.called;
        });

        it('should pass a reference to itself to the Zones constructor', () => {
            let connectionConstructor = sinon.stub();
            Connection = proxyquire('../lib/Connection', {
                './Zones': connectionConstructor
            });

            let connection = new Connection({
                'host': 'abc',
                'port': 8080,
                'protocol': 'http',
                'key': 'abc'
            });

            return expect(connectionConstructor).to.have.been.called;
        });

        it('should default to being not connected', () => {
            let connection = new Connection({
                'host': 'abc',
                'port': 8080,
                'protocol': 'http',
                'key': 'abc'
            });

            return expect(connection.connected).to.be.false;
        });
    });

    describe('properties', () => {
        const configuration = {
            'host': 'abc',
            'port': 8080,
            'protocol': 'http',
            'key': 'abc'
        };

        let connection;

        before(() => {
            Connection = require('../lib/Connection');
        });

        beforeEach(() => {
            connection = new Connection(configuration);
        });

        it('should have a `Zones` property', () => {
            return expect(connection).to.have.property('zones');
        });

        it('should have a `Records` property', () => {
            return expect(connection).to.have.property('records');
        });
    });

    describe('get()', () => {
        const configuration = {
            'host': 'abc',
            'port': 8080,
            'protocol': 'http',
            'key': 'abcd'
        };

        let connection,
            requestStub;

        before(() => {
            requestStub = sinon.stub();

            Connection = proxyquire('../lib/Connection', {
                'request': requestStub
            });
        });

        beforeEach(() => {
            connection = new Connection(configuration);
            connection.connected = true;
        });

        it('should return a Promise', () => {
            return expect(connection.get()).to.be.an.instanceOf(Promise);
        });

        it('should reject if not passed a URL', () => {
            return expect(connection.get()).to.eventually.be.rejectedWith('url must be supplied');
        });

        it('should reject if not connected', () => {
            connection.connected = false;
            return expect(connection.get('/')).to.eventually.be.rejectedWith('Connection is not connected');
        });

        it('should use the `GET` HTTP method', () => {
            let expectedMethod = 'GET';
            requestStub.yields(null, null, null);

            return connection.get('/')
            .then(() => {
                return expect(requestStub).to.have.been.calledWith(sinon.match({
                    method: expectedMethod
                }));
            });
        });

        it('should use the configured `key` for Authentication', () => {
            let expectedAuthHeader = configuration.key;
            requestStub.yields(null, null, null);

            return connection.get('/')
            .then(() => {
                return expect(requestStub).to.have.been.calledWith(sinon.match({
                    headers: sinon.match({
                        'X-API-Key': expectedAuthHeader
                    })
                }));
            });
        });

        it('should reject if Authentication fails', () => {
            requestStub.yields(true, { statusCode: 401 }, null);

            return expect(connection.get('/')).to.eventually.be.rejectedWith('Unauthorised');
        });

        it('should reject if the network connection fails', () => {
            let err = new Error('connect ECONNREFUSED');
            err.code = 'ECONNREFUSED';

            requestStub.yields(err, null, null);

            return expect(connection.get('/')).to.eventually.be.rejectedWith(err);
        });

        it('should resolve with the body response when the connection succeeds', () => {
            let expectedBody = 'abcd';

            requestStub.yields(null, null, expectedBody);

            return connection.get('/')
            .then((body) => {
                return expect(body).to.deep.equal(expectedBody);
            });
        });
    });

    describe('connect()', () => {
        const configuration = {
            'host': 'abc',
            'port': 8080,
            'protocol': 'http',
            'key': 'abcd'
        };

        let connection,
            requestStub,
            validServer;

        before(() => {
            requestStub = sinon.stub();

            Connection = proxyquire('../lib/Connection', {
                'request': requestStub
            });

            validServer = {
                'type': 'Server',
                'id': 'localhost',
                'url': '/servers/localhost',
                'daemon_type': 'authoritative',
                'version': '3.4.7',
                'config_url': '/servers/localhost/config{/config_setting}',
                'zones_url': '/servers/localhost/zones{/zone}'
            }
        });

        beforeEach(() => {
            connection = new Connection(configuration);
        });

        it('should return a Promise', () => {
            return expect(connection.connect()).to.be.an.instanceOf(Promise);
        });

        it('should connect to `/servers` endpoint to fetch server configuration', () => {
            let expectedURL = `${configuration.protocol}://${configuration.host}:${configuration.port}/servers`;
            requestStub.yields(null, null, [validServer]);

            return connection.connect()
            .then(() => {
                return expect(requestStub).to.have.been.calledWith(sinon.match({
                    url: expectedURL
                }));
            });
        });

        it('should reject if the server connected to does not return an expected result', () => {
            requestStub.yields(null, null, null);

            return expect(connection.connect()).to.eventually.be.rejectedWith('API returned invalid results');
        });

        it('should store the zones url for the connected server', () => {
            let expectedZonesURL = 'abcd';

            validServer.zones_url = expectedZonesURL;
            requestStub.yields(null, null, [
                validServer
            ]);

            return connection.connect()
            .then(() => {
                return expect(connection.zones_url).to.equal(expectedZonesURL);
            });
        });

        it('should set the Connections connected state to true', () => {
            requestStub.yields(null, null, [
                validServer
            ]);

            return connection.connect()
            .then(() => {
                return expect(connection.connected).to.equal(true);
            });
        });

        it('should resolve when the connection succeeds', () => {
            requestStub.yields(null, null, [
                validServer
            ]);

            return expect(connection.connect()).to.eventually.be.fulfilled;
        });
    });
});
