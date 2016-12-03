import assert from 'assert';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import _ from 'underscore';
import backbone from 'backbone';
import {
  EventTarget,
} from '../../testutils';

proxyquire.noCallThru();

let nfcAdapter,
    tiNfc,
    NFCHandler,
    enableForegroundDispatch,
    disableForegroundDispatch,
    onNewIntent;

describe('NFCHandler', () => {
    beforeEach(() => {
        enableForegroundDispatch = sinon.spy();
        disableForegroundDispatch = sinon.spy();
        onNewIntent = sinon.spy();

        nfcAdapter = {
            enableForegroundDispatch,
            disableForegroundDispatch,
            onNewIntent,
            isEnabled: () => (true),
        };
        tiNfc = {
            createNfcForegroundDispatchFilter: sinon.stub(),
            createNfcAdapter: args => (_.extend(nfcAdapter, args)),
        };
        NFCHandler = proxyquire('../../../app/lib/NFCHandler', {
            'ti.nfc': tiNfc,
            'alloy/backbone': backbone,
            'alloy/underscore': _,
        });
    });

    it('triggers discovered on discover NFC', () => {
        const nfcHandler = new NFCHandler(new EventTarget()),
            discoverHandler = sinon.spy();

        nfcHandler.on('discovered', discoverHandler);
        nfcAdapter.onNdefDiscovered();
        assert(discoverHandler.calledOnce, true);
    });

    it('activity-newintent calls newintent', () => {
        /* eslint-disable no-unused-vars */
        const activity = new EventTarget(),
            nfcHandler = new NFCHandler(activity);
        /* eslint-enable no-unused-vars */
        activity.dispatchEvent({ type: 'newintent' });

        assert(onNewIntent.calledOnce, true);
    });

    it('activity-onPause calls disableForegroundDispatch', () => {
        /* eslint-disable no-unused-vars */
        const activity = new EventTarget(),
            nfcHandler = new NFCHandler(activity);
        /* eslint-enable no-unused-vars */
        activity.dispatchEvent({ type: 'pause' });

        assert(disableForegroundDispatch.calledOnce, true);
        assert(enableForegroundDispatch.calledOnce, true);
    });

    it('activity-onResume calls enableForegroundDispatch', () => {
        /* eslint-disable no-unused-vars */
        const activity = new EventTarget(),
            nfcHandler = new NFCHandler(activity);
        /* eslint-enable no-unused-vars */
        activity.dispatchEvent({ type: 'resume' });

        assert(enableForegroundDispatch.calledTwice, true);
        assert(disableForegroundDispatch.notCalled, true);
    });

    it('destruct removes eventlisteners', () => {
        const activity = new EventTarget(),
            nfcHandler = new NFCHandler(activity);
        nfcHandler.destruct();
        activity.dispatchEvent({ type: 'resume' });
        activity.dispatchEvent({ type: 'pause' });
        activity.dispatchEvent({ type: 'newintent' });

        assert(enableForegroundDispatch.calledOnce, true);
        assert(disableForegroundDispatch.notCalled, true);
        assert(onNewIntent.notCalled, true);
    });

    it('disabled nfcAdapter doesn\'t set eventlisteners', () => {
        nfcAdapter.isEnabled = () => (false);
        /* eslint-disable no-unused-vars */
        const activity = new EventTarget(),
            nfcHandler = new NFCHandler(activity);
        /* eslint-enable no-unused-vars */
        activity.dispatchEvent({ type: 'resume' });
        activity.dispatchEvent({ type: 'pause' });
        activity.dispatchEvent({ type: 'newintent' });

        assert(enableForegroundDispatch.notCalled, true);
        assert(disableForegroundDispatch.notCalled, true);
        assert(onNewIntent.notCalled, true);
    });
});
