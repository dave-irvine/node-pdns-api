import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);
chai.use(chaiAsPromised);

import pdns from '../';
import Connection from '../lib/Connection';

describe('pdns-api', () => {
    describe('createConnection()', () => {
        it('should throw if a Configuration object is not provided', () => {
            return expect(() => {
                pdns.createConnection();
            }).throw('Configuration object is required');
        });

        it('should return a Connection object', () => {
            const configuration = {};

            return expect(pdns.createConnection(configuration)).to.be.an.instanceOf(Connection);
        });
    });
});
