import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('pdns-api', () => {
    let pdns;

    it('should provide createConnection() at the root level', () => {
        let pdns = require('../');

        return expect(pdns.createConnection).to.be.a('Function');
    });

    describe('createConnection()', () => {
        it('should construct a Connection instance', () => {
            let connectionConstructor = sinon.stub();
            pdns = proxyquire('../lib/index.js', {
                './Connection': connectionConstructor
            });

            pdns.createConnection({});
            return expect(connectionConstructor).to.have.been.called;
        });
    });
});
