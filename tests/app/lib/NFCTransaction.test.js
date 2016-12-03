import assert from 'assert';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import _ from 'underscore';
import backbone from 'backbone';
import {
  getCollection,
} from '../../testutils';

proxyquire.noCallThru();

function createNFCHandler() {
    return function () {
        return _.clone(backbone.Events);
    };
}

const TransactionCollection = getCollection('transaction'),
    getNFCTransaction = nfcHandler => (proxyquire('../../../app/lib/NFCTransaction', {
        'alloy/backbone': backbone,
        'alloy/underscore': _,
        './NFCHandler': () => nfcHandler,
    }));

describe('discovered nfc tag', () => {
    it('creates a new transaction', () => {
        const NFCHandler = createNFCHandler(),
            nfcHandler = new NFCHandler(),
            NFCTransaction = getNFCTransaction(nfcHandler),
            transactionCollection = new TransactionCollection(),
            nfcTransation = new NFCTransaction(sinon.spy(), transactionCollection),
            newTransactionEvent = sinon.spy();

        nfcTransation.on('transaction:new', newTransactionEvent);
        nfcHandler.trigger('discovered');
        assert.equal(transactionCollection.length, 1);
        assert.equal(newTransactionEvent.calledOnce, true);
    });
});

describe('destruct of NFCTransaction', () => {
    it('calls destruct of NFCHandler', () => {
        const NFCHandler = createNFCHandler(),
            nfcHandler = new NFCHandler(),
            NFCTransaction = getNFCTransaction(nfcHandler),
            nfcTransation = new NFCTransaction(sinon.spy(), new TransactionCollection());

        nfcHandler.destruct = sinon.spy();
        nfcTransation.destruct();
        assert.equal(nfcHandler.destruct.calledOnce, true);
    });
});
