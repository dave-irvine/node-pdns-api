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
});
